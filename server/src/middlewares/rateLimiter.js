import rateLimit from 'express-rate-limit';

// Rate limiter geral para a API (ex: 120 requisições por minuto por IP)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições originadas deste IP. Por favor, aguarde alguns instantes.'
  }
});

// Rate limiter específico para criação de Pix (evita flood no gateway MP)
export const pixCreationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Limite de geração de cobranças Pix atingido para este minuto. Tente novamente em 60 segundos.'
  }
});

// Rate limiter para o endpoint de checagem de status / time-left
export const statusPollingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas checagens de status. Reduza a frequência.'
  }
});
