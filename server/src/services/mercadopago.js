import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';
import { env } from '../config/env.js';

let paymentClient = null;

if (env.MP_ACCESS_TOKEN && !env.MP_ACCESS_TOKEN.startsWith('TEST-000000')) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: env.MP_ACCESS_TOKEN,
      options: { timeout: 10000 }
    });
    paymentClient = new Payment(client);
    console.log('[MP] SDK do Mercado Pago configurado com sucesso.');
  } catch (err) {
    console.warn('[MP] Erro ao inicializar Mercado Pago SDK:', err.message);
  }
} else {
  console.log('[MP] MP_ACCESS_TOKEN padrão/teste detectado. Modo Mock ativo para simulação local.');
}

/**
 * Cria cobrança Pix transparente
 */
export async function createPixPayment({ sessionId, firstName, email, amount = 4.99 }) {
  const payerEmail = email || `cliente_${sessionId.substring(0, 8)}@weblunar.com.br`;
  const expirationDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

  if (paymentClient) {
    try {
      const body = {
        transaction_amount: Number(amount),
        description: 'Dossie Confidencial de Percepcao Social',
        payment_method_id: 'pix',
        payer: {
          email: payerEmail,
          first_name: firstName
        },
        external_reference: sessionId,
        date_of_expiration: expirationDate
      };

      // O Mercado Pago só aceita notification_url se for uma URL pública válida (não localhost)
      if (env.BASE_URL && !env.BASE_URL.includes('localhost') && env.BASE_URL.startsWith('http')) {
        body.notification_url = `${env.BASE_URL}/api/webhook/mercadopago`;
      }

      const response = await paymentClient.create({ body });
      const pointOfInteraction = response.point_of_interaction?.transaction_data;

      return {
        paymentId: String(response.id),
        status: response.status,
        qrCodeBase64: pointOfInteraction?.qr_code_base64 || null,
        qrCodeCopyPaste: pointOfInteraction?.qr_code || null,
        expiresAt: expirationDate
      };
    } catch (err) {
      console.error('[MP] Erro ao criar cobrança Pix real:', err);
      // Se falhar a chamada externa em dev, faz fallback resiliente
      if (env.NODE_ENV === 'development') {
        return generateMockPix(sessionId, expirationDate);
      }
      throw err;
    }
  } else {
    return generateMockPix(sessionId, expirationDate);
  }
}

/**
 * Consulta status de um pagamento diretamente na API do Mercado Pago (Double-Check)
 */
export async function getPaymentDetails(paymentId) {
  if (paymentClient && !paymentId.startsWith('mock_')) {
    try {
      const payment = await paymentClient.get({ id: paymentId });
      return {
        id: String(payment.id),
        status: payment.status,
        externalReference: payment.external_reference,
        transactionAmount: payment.transaction_amount
      };
    } catch (err) {
      console.error('[MP] Erro ao consultar pagamento na API:', err.message);
      throw err;
    }
  } else {
    return {
      id: paymentId,
      status: 'approved',
      externalReference: paymentId.replace('mock_payment_', ''),
      transactionAmount: 4.99
    };
  }
}

/**
 * Validação da assinatura x-signature do webhook do Mercado Pago
 */
export function verifyWebhookSignature(headers, rawBody) {
  if (!env.MP_WEBHOOK_SECRET || env.MP_WEBHOOK_SECRET.trim() === '') {
    if (env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  const xSignature = headers['x-signature'];
  const xRequestId = headers['x-request-id'];

  if (!xSignature) return false;

  try {
    const parts = xSignature.split(',');
    let ts = null;
    let hash = null;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key.trim() === 'ts') ts = value.trim();
      if (key.trim() === 'v1') hash = value.trim();
    }

    if (!ts || !hash) return false;

    const manifest = `id:${rawBody?.data?.id};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', env.MP_WEBHOOK_SECRET);
    hmac.update(manifest);
    const calculatedHash = hmac.digest('hex');

    return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash));
  } catch (err) {
    console.error('[MP] Erro ao validar x-signature do webhook:', err.message);
    return false;
  }
}

function generateMockPix(sessionId, expirationDate) {
  const mockSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200"><rect width="200" height="200" fill="#ffffff"/><rect x="20" y="20" width="40" height="40" fill="#0f172a"/><rect x="140" y="20" width="40" height="40" fill="#0f172a"/><rect x="20" y="140" width="40" height="40" fill="#0f172a"/><rect x="30" y="30" width="20" height="20" fill="#ffffff"/><rect x="150" y="30" width="20" height="20" fill="#ffffff"/><rect x="30" y="150" width="20" height="20" fill="#ffffff"/><rect x="80" y="80" width="40" height="40" fill="#6366f1"/><text x="100" y="185" font-size="10" text-anchor="middle" fill="#64748b" font-family="sans-serif">MOCK PIX (TESTE)</text></svg>`;
  const base64Svg = Buffer.from(mockSvg).toString('base64');

  return {
    paymentId: `mock_payment_${sessionId}`,
    status: 'pending',
    qrCodeBase64: base64Svg,
    qrCodeCopyPaste: `00020126580014br.gov.bcb.pix0136${sessionId}52040000530398654044.995802BR5915WEBLUNAR QUIZ6009SAO PAULO62070503***6304MOCK`,
    expiresAt: expirationDate
  };
}
