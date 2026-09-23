import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.js';

let transporter = null;
let resendClient = null;

// 1. Configura Gmail SMTP via Nodemailer se credenciais existirem
if (env.SMTP_USER && env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS.replace(/\s+/g, '') // remove espaços se houver
      }
    });
    console.log(`[MAILER] Serviço Gmail SMTP conectado para: ${env.SMTP_USER}`);
  } catch (err) {
    console.warn('[MAILER] Erro ao inicializar Gmail SMTP:', err.message);
  }
} else if (env.RESEND_API_KEY && env.RESEND_API_KEY.trim() !== '') {
  resendClient = new Resend(env.RESEND_API_KEY);
  console.log('[MAILER] Serviço Resend API ativado.');
}

/**
 * Envia e-mail de entrega do Dossiê Completo com o arquivo PDF anexado diretamente
 */
export async function sendDossierBackupEmail({ to, firstName, sessionId, accessToken, archetypeTitle, pdfBuffer }) {
  if (!to) return;

  const pdfFilename = `Dossie-Percepcao-Social-${(firstName || 'Oficial').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Seu Dossiê Confidencial</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #12142e; border: 1px solid #1e214a; border-radius: 16px; overflow: hidden; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <tr>
          <td style="padding: 36px 24px; text-align: center; background: linear-gradient(180deg, #181b3d 0%, #12142e 100%); border-bottom: 1px solid #1e214a;">
            <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a78bfa; font-weight: 700; display: block; margin-bottom: 8px;">Relatório Comportamental Confidencial</span>
            <h1 style="color: #ffffff; font-size: 26px; margin: 0 0 8px 0; font-weight: 800;">Dossiê de Percepção Social</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Seu arquétipo dominante foi desbloqueado com sucesso.</p>
          </td>
        </tr>

        <!-- Conteúdo -->
        <tr>
          <td style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #f8fafc; margin: 0 0 16px 0;">Olá, <strong>${firstName}</strong>!</p>
            <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0;">
              Confirmamos o seu pagamento. O seu relatório comportamental completo foi processado e <strong>está anexado a este e-mail em formato PDF oficial</strong> para você baixar e salvar permanentemente em seu aparelho.
            </p>

            <!-- Card do Arquétipo -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0d0e1f; border-left: 4px solid #8b5cf6; border-radius: 10px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 18px 20px;">
                  <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 700; display: block; margin-bottom: 4px;">Arquétipo Identificado</span>
                  <h2 style="color: #c084fc; font-size: 20px; margin: 0 0 4px 0; font-weight: 800;">${archetypeTitle}</h2>
                  <p style="color: #94a3b8; font-size: 13px; margin: 0;">Dossiê completo com 4 capítulos, métricas ocultas, pontos cegos e guia de ativação.</p>
                </td>
              </tr>
            </table>

            <!-- Destaque do Anexo PDF -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #064e3b33; border: 1px dashed #22c55e; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 22px 20px; text-align: center;">
                  <span style="font-size: 28px; display: block; margin-bottom: 8px;">📎</span>
                  <strong style="color: #4ade80; font-size: 16px; display: block; margin-bottom: 6px;">Seu Arquivo PDF está Anexado Abaixo</strong>
                  <span style="color: #cbd5e1; font-size: 13px; line-height: 1.5; display: block; max-width: 440px; margin: 0 auto;">
                    Localize e baixe o anexo <strong>${pdfFilename}</strong> desta mensagem para salvar o seu dossiê confidencial e consultar quando quiser.
                  </span>
                </td>
              </tr>
            </table>

            <!-- Linha Divisória -->
            <div style="border-top: 1px solid #1e214a; margin: 20px 0;"></div>

            <!-- Instrução de Propriedade & Privacidade -->
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin: 0;">
              🔒 <strong>Documento Confidencial:</strong> Este relatório é de uso pessoal e intransferível. Por motivos de privacidade e sigilo dos seus dados comportamentais, o documento foi entregue diretamente a você em formato de arquivo fechado. Guarde-o em local seguro.
            </p>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="padding: 20px 24px; text-align: center; background-color: #0d0e1f; border-top: 1px solid #1e214a;">
            <p style="font-size: 11px; color: #475569; margin: 0;">
              © WebLunar Analytics • Todos os direitos reservados.
            </p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;

  const mailAttachments = [];
  if (pdfBuffer && Buffer.isBuffer(pdfBuffer)) {
    mailAttachments.push({
      filename: pdfFilename,
      content: pdfBuffer,
      contentType: 'application/pdf'
    });
  }

  // Envio via Gmail SMTP (Nodemailer)
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject: `${firstName}, seu Dossiê de Percepção Social está em anexo (PDF)`,
        html: htmlContent,
        attachments: mailAttachments
      });
      console.log(`[MAILER GMAIL] E-mail com anexo PDF enviado com sucesso para ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[MAILER GMAIL] Falha ao enviar para ${to}:`, err.message);
      throw err;
    }
  }

  // Fallback Resend
  if (resendClient) {
    try {
      const payload = {
        from: env.EMAIL_FROM,
        to,
        subject: `${firstName}, seu Dossiê de Percepção Social está em anexo (PDF)`,
        html: htmlContent
      };
      if (mailAttachments.length > 0) {
        payload.attachments = mailAttachments.map(att => ({
          filename: att.filename,
          content: att.content
        }));
      }
      const res = await resendClient.emails.send(payload);
      console.log(`[MAILER RESEND] E-mail enviado para ${to}`);
      return { success: true, id: res.id };
    } catch (err) {
      console.error(`[MAILER RESEND] Falha ao enviar para ${to}:`, err.message);
    }
  }

  console.log(`[MAILER MOCK] Nenhuma credencial SMTP/Resend ativa. Simulação para ${to} com anexo PDF.`);
  return { success: true, mock: true };
}
