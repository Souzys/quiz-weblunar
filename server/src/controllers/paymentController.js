import crypto from 'crypto';
import { z } from 'zod';
import { getSession, updateSessionPix, markSessionPaid, isWebhookEventProcessed, recordWebhookEvent } from '../db/client.js';
import { createPixPayment, getPaymentDetails, verifyWebhookSignature } from '../services/mercadopago.js';
import { sseBroker } from '../services/sseBroker.js';
import { sendDossierBackupEmail } from '../services/mailer.js';
import { generateDossierPdf } from '../services/pdfGenerator.js';
import { ARCHETYPES } from '../data/archetypes.js';
import { env } from '../config/env.js';

const generatePixSchema = z.object({
  sessionId: z.string().uuid('ID de sessão inválido'),
  email: z.string().email('E-mail inválido para envio do comprovante').optional().or(z.literal(''))
});

/**
 * Gera cobrança Pix via Mercado Pago (Checkout Transparente)
 */
export async function generatePix(req, res) {
  try {
    const parseResult = generatePixSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { sessionId, email } = parseResult.data;
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão do teste não encontrada.' });
    }

    if (session.status === 'APPROVED') {
      return res.status(400).json({ error: 'Esta sessão já foi paga e liberada.' });
    }

    // Se já tiver um Pix gerado recentemente (menos de 20 minutos), pode reaproveitar
    if (session.pix_copy_paste && session.mp_payment_id) {
      return res.json({
        sessionId,
        paymentId: session.mp_payment_id,
        qrCodeBase64: session.pix_qr_code,
        qrCodeCopyPaste: session.pix_copy_paste,
        amount: 4.99
      });
    }

    // Cria cobrança no gateway
    const payment = await createPixPayment({
      sessionId,
      firstName: session.first_name,
      email: email || session.email,
      amount: 4.99
    });

    // Salva dados do Pix na sessão
    await updateSessionPix(sessionId, {
      mp_payment_id: payment.paymentId,
      pix_qr_code: payment.qrCodeBase64,
      pix_copy_paste: payment.qrCodeCopyPaste,
      email: email || null
    });

    return res.json({
      sessionId,
      paymentId: payment.paymentId,
      qrCodeBase64: payment.qrCodeBase64,
      qrCodeCopyPaste: payment.qrCodeCopyPaste,
      amount: 4.99,
      expiresAt: payment.expiresAt
    });
  } catch (err) {
    console.error('[PAYMENT_CONTROLLER] Erro ao gerar Pix:', err);
    return res.status(500).json({ error: 'Falha ao comunicar com o gateway de pagamentos.' });
  }
}

/**
 * Regenera código Pix caso o anterior tenha expirado (Salva-Vendas)
 */
export async function refreshPix(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    if (session.status === 'APPROVED') {
      return res.status(400).json({ error: 'Esta análise já está paga.' });
    }

    // Gera nova cobrança
    const payment = await createPixPayment({
      sessionId,
      firstName: session.first_name,
      email: session.email,
      amount: 4.99
    });

    await updateSessionPix(sessionId, {
      mp_payment_id: payment.paymentId,
      pix_qr_code: payment.qrCodeBase64,
      pix_copy_paste: payment.qrCodeCopyPaste,
      email: session.email
    });

    return res.json({
      sessionId,
      paymentId: payment.paymentId,
      qrCodeBase64: payment.qrCodeBase64,
      qrCodeCopyPaste: payment.qrCodeCopyPaste,
      amount: 4.99,
      expiresAt: payment.expiresAt
    });
  } catch (err) {
    console.error('[PAYMENT_CONTROLLER] Erro ao renovar Pix:', err);
    return res.status(500).json({ error: 'Erro ao renovar cobrança Pix.' });
  }
}

/**
 * Simulação de Aprovação para testes em ambiente de desenvolvimento
 */
export async function simulateApproval(req, res) {
  if (env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Rota de simulação desativada em produção.' });
  }

  const { sessionId } = req.params;

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    const accessToken = crypto.randomBytes(24).toString('hex');
    const updated = await markSessionPaid(sessionId, {
      access_token: accessToken,
      mp_payment_id: `simulated_${Date.now()}`
    });

    // Notifica em tempo real via SSE
    sseBroker.notifyPaymentApproved(sessionId, { token: accessToken });

    // Dispara e-mail com anexo PDF se tiver e-mail
    if (session.email) {
      const archetype = ARCHETYPES[session.archetype_id] || ARCHETYPES['o-enigma-magnetico'];
      generateDossierPdf({
        firstName: session.first_name,
        archetype,
        sessionId
      }).then((pdfBuffer) => {
        return sendDossierBackupEmail({
          to: session.email,
          firstName: session.first_name,
          sessionId,
          accessToken,
          archetypeTitle: archetype.title,
          pdfBuffer
        });
      }).catch(err => console.error('[MAILER/PDF] Erro em background:', err));
    }

    return res.json({
      success: true,
      message: 'Pagamento simulado com sucesso!',
      sessionId,
      token: accessToken
    });
  } catch (err) {
    console.error('[PAYMENT_CONTROLLER] Erro na simulação de aprovação:', err);
    return res.status(500).json({ error: 'Erro interno na simulação.' });
  }
}

/**
 * Webhook Oficial do Mercado Pago com Idempotência Estrita e Double-Check
 */
export async function handleWebhook(req, res) {
  try {
    const headers = req.headers;
    const body = req.body;

    // 1. Validação da assinatura do webhook
    const isValidSignature = verifyWebhookSignature(headers, body);
    if (!isValidSignature) {
      console.warn('[WEBHOOK] Assinatura x-signature inválida ou ausente.');
      return res.status(401).json({ error: 'Assinatura de webhook inválida.' });
    }

    // Mercado Pago pode enviar query params tipo ?type=payment&data.id=123
    const paymentId = body?.data?.id || req.query['data.id'];
    const eventType = body?.type || req.query.type || 'payment';

    if (!paymentId || eventType !== 'payment') {
      // Retorna 200 para eventos secundários que não nos interessam
      return res.status(200).json({ received: true, ignored: true });
    }

    // 2. Verificação de Idempotência: já processamos este payment_id antes?
    const alreadyProcessed = await isWebhookEventProcessed(paymentId);
    if (alreadyProcessed) {
      console.log(`[WEBHOOK IDEMPOTÊNCIA] Pagamento ${paymentId} já foi processado anteriormente. Ignorando.`);
      return res.status(200).json({ received: true, idempotent: true });
    }

    // 3. Chamada Reversa de Auditoria (Double-Check na API do Mercado Pago)
    console.log(`[WEBHOOK] Validando pagamento ${paymentId} diretamente na API do MP...`);
    const paymentDetails = await getPaymentDetails(paymentId);

    if (paymentDetails.status === 'approved' && paymentDetails.transactionAmount >= 4.90) {
      const sessionId = paymentDetails.externalReference;
      const session = await getSession(sessionId);

      if (session) {
        const accessToken = crypto.randomBytes(24).toString('hex');
        await markSessionPaid(sessionId, {
          access_token: accessToken,
          mp_payment_id: String(paymentId)
        });

        // 4. Registra na tabela de idempotência
        await recordWebhookEvent(paymentId, eventType, body);

        // 5. Notifica cliente conectado via SSE instantaneamente
        sseBroker.notifyPaymentApproved(sessionId, { token: accessToken });
        console.log(`[WEBHOOK SUCESSO] Pagamento ${paymentId} aprovado para sessão ${sessionId}. SSE notificado!`);

        // 6. Dispara e-mail com anexo PDF em background
        if (session.email) {
          const archetype = ARCHETYPES[session.archetype_id] || ARCHETYPES['o-enigma-magnetico'];
          generateDossierPdf({
            firstName: session.first_name,
            archetype,
            sessionId
          }).then((pdfBuffer) => {
            return sendDossierBackupEmail({
              to: session.email,
              firstName: session.first_name,
              sessionId,
              accessToken,
              archetypeTitle: archetype.title,
              pdfBuffer
            });
          }).catch(err => console.error('[MAILER/PDF] Falha no disparo assíncrono com anexo:', err));
        }
      } else {
        console.warn(`[WEBHOOK] Sessão externa ${sessionId} não encontrada no banco.`);
      }
    } else {
      console.log(`[WEBHOOK] Pagamento ${paymentId} com status não aprovado: ${paymentDetails.status}`);
    }

    // Sempre responde 200 ao gateway para confirmar recebimento
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[WEBHOOK] Erro no processamento:', err);
    // Retorna 500 para o gateway tentar novamente se foi um erro de infraestrutura
    return res.status(500).json({ error: 'Erro interno ao processar notificação.' });
  }
}
