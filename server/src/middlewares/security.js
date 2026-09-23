import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env.js';
import { getSession } from '../db/client.js';

export const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Permite carregar recursos do front e SVGs inline
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (como curl, mobile apps nativos ou webhooks de servidor)
    if (!origin) return callback(null, true);
    
    // Verifica se a origin está na lista ou se é localhost em dev
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed === origin) return true;
      if (env.NODE_ENV === 'development' && origin.includes('localhost')) return true;
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`[CORS] Bloqueada requisição de origem não permitida: ${origin}`);
      return callback(new Error('Origem não permitida pela política de CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
});

/**
 * Middleware para validação anti-IDOR na entrega do Dossiê Completo
 * O dossiê NUNCA é entregue se o status for diferente de APPROVED
 */
export async function requirePaidSession(req, res, next) {
  const { sessionId } = req.params;
  const clientToken = req.headers['x-access-token'] || req.query.token;

  if (!sessionId) {
    return res.status(400).json({ error: 'ID de sessão não fornecido.' });
  }

  try {
    const session = await getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Sessão de diagnóstico não encontrada.' });
    }

    if (session.status !== 'APPROVED') {
      return res.status(403).json({
        error: 'Acesso não autorizado. O dossiê completo ainda não foi liberado para esta sessão.',
        status: session.status
      });
    }

    // Se a sessão possui token gerado na aprovação, valida o token
    if (session.access_token && clientToken && session.access_token !== clientToken) {
      return res.status(401).json({ error: 'Token de acesso inválido para esta sessão.' });
    }

    req.quizSession = session;
    next();
  } catch (err) {
    console.error('[AUTH_DOSSIER] Erro ao validar sessão paga:', err);
    return res.status(500).json({ error: 'Erro interno ao validar acesso ao dossiê.' });
  }
}
