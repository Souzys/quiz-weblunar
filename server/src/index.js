import express from 'express';
import { env } from './config/env.js';
import { helmetMiddleware, corsMiddleware, requirePaidSession } from './middlewares/security.js';
import { globalLimiter, pixCreationLimiter, statusPollingLimiter } from './middlewares/rateLimiter.js';
import {
  startQuiz,
  getTimeLeft,
  getPublicStatus,
  getDossier,
  downloadDossierPdf,
  streamStatus,
  recoverDossier
} from './controllers/quizController.js';
import {
  generatePix,
  refreshPix,
  simulateApproval,
  handleWebhook
} from './controllers/paymentController.js';

const app = express();

// Middlewares de Segurança Básica
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Parser de JSON com suporte a raw body para webhook
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Rate Limiter Geral
app.use('/api', globalLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ==========================================
// ROTAS DO QUIZ & CONVERSÃO
// ==========================================

// Iniciar Quiz e Obter Diagnóstico Parcial
app.post('/api/quiz/start', startQuiz);

// Server-Side Timer: Tempo restante de desconto
app.get('/api/quiz/time-left/:sessionId', statusPollingLimiter, getTimeLeft);

// Status Público da Sessão (para Fallback de Polling)
app.get('/api/quiz/status/:sessionId', statusPollingLimiter, getPublicStatus);

// Server-Sent Events (SSE): Atualização instantânea em tempo real
app.get('/api/quiz/stream/:sessionId', streamStatus);

// Dossiê Completo (Blindado contra IDOR: Só entrega se pago)
app.get('/api/quiz/dossier/:sessionId', requirePaidSession, getDossier);

// Download Oficial do PDF Vetorial (Blindado contra IDOR: Só entrega se pago)
app.get('/api/quiz/download-pdf/:sessionId', requirePaidSession, downloadDossierPdf);

// Recuperação de Dossiê por E-mail (Zero Suporte)
app.post('/api/quiz/recover', recoverDossier);

// ==========================================
// ROTAS DE PAGAMENTO PIX & WEBHOOK
// ==========================================

// Gerar Cobrança Pix Transparente Mercado Pago
app.post('/api/payment/pix', pixCreationLimiter, generatePix);

// Renovar Cobrança Pix Expirada em 1 clique
app.post('/api/payment/refresh-pix/:sessionId', pixCreationLimiter, refreshPix);

// Simulação de Pagamento para Testes Locais em Dev
app.post('/api/payment/simulate/:sessionId', simulateApproval);

// Webhook Oficial do Mercado Pago
app.post('/api/webhook/mercadopago', handleWebhook);

// Tratamento de Rotas Inexistentes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

// Error Handler Global
app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

// Inicialização do Servidor
app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 QUIZ API ATIVA NA PORTA: ${env.PORT}`);
  console.log(`🌍 MODO: ${env.NODE_ENV.toUpperCase()}`);
  console.log(`📡 URL BASE: ${env.BASE_URL}`);
  console.log(`🔒 ANTI-IDOR & RATE LIMITING ATIVOS`);
  console.log(`⚡ SERVER-SENT EVENTS (SSE) PRONTO`);
  console.log(`====================================================`);
});
