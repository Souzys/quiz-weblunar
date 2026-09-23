import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createSession, getSession, getPaidSessionsByEmail } from '../db/client.js';
import { calculateArchetype, ARCHETYPES } from '../data/archetypes.js';
import { sseBroker } from '../services/sseBroker.js';
import { generateDossierPdf } from '../services/pdfGenerator.js';

const startQuizSchema = z.object({
  firstName: z.string().min(1, 'Primeiro nome é obrigatório').max(100),
  answers: z.record(z.string()).refine(val => Object.keys(val).length >= 5, {
    message: 'Responda pelo menos 5 perguntas para calibrar a análise.'
  })
});

/**
 * Inicia a sessão do quiz, calcula o arquétipo e gera a degustação da Lógica B:
 * - Capítulo 1: TOTALMENTE LIBERADO (com gancho para o cap 2)
 * - Capítulo 2: Primeiro parágrafo visível (meio liberado / meio blur)
 * - Capítulo 3 e 4: Trancados
 */
export async function startQuiz(req, res) {
  try {
    const parseResult = startQuizSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { firstName, answers } = parseResult.data;
    const archetype = calculateArchetype(answers);
    const sessionId = uuidv4();

    // Timer de escassez server-side: 15 minutos a partir de agora
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await createSession({
      id: sessionId,
      first_name: firstName.trim(),
      archetype_id: archetype.id,
      answers,
      status: 'PENDING_PAYMENT',
      expires_at: expiresAt
    });

    // Retorna a degustação estruturada da Lógica B:
    return res.status(201).json({
      sessionId,
      firstName: firstName.trim(),
      archetype: {
        id: archetype.id,
        title: archetype.title,
        tagline: archetype.tagline,
        badge: archetype.badge,
        scores: archetype.scores,
        freePreview: archetype.free_preview,
        // Capítulo 1 Completo (A prova cabal da precisão e qualidade)
        chapter1: archetype.full_dossier.chapter1_first_impression,
        // Capítulo 2 Parcial (Ponte de curiosidade)
        chapter2_preview: {
          title: archetype.full_dossier.chapter2_hidden_trait.title,
          preview: archetype.full_dossier.chapter2_hidden_trait.preview
        },
        // Capítulo 3 Teaser
        chapter3_teaser: {
          title: archetype.full_dossier.chapter3_blind_spot.title,
          teaser: archetype.full_dossier.chapter3_blind_spot.teaser
        },
        // Capítulo 4 Teaser (O Guia de Ativação prático)
        chapter4_teaser: {
          title: archetype.full_dossier.chapter4_activation_key.title
        }
      },
      expiresAt: expiresAt.toISOString()
    });
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao iniciar quiz:', err);
    return res.status(500).json({ error: 'Erro interno ao processar respostas do quiz.' });
  }
}

/**
 * Retorna os segundos restantes calculados estritamente pelo relógio do servidor
 */
export async function getTimeLeft(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    const expiresAt = new Date(session.expires_at).getTime();
    const now = Date.now();
    const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

    return res.json({
      sessionId,
      secondsLeft,
      isExpired: secondsLeft === 0,
      status: session.status
    });
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao consultar tempo restante:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar tempo restante.' });
  }
}

/**
 * Consulta de status público da sessão (para fallback de polling)
 */
export async function getPublicStatus(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    return res.json({
      sessionId,
      status: session.status,
      token: session.status === 'APPROVED' ? session.access_token : null,
      hasPixGenerated: !!session.pix_copy_paste
    });
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao consultar status da sessão:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar status.' });
  }
}

/**
 * Entrega o dossiê completo (Protegido pelo middleware requirePaidSession)
 */
export async function getDossier(req, res) {
  const session = req.quizSession;
  const archetype = ARCHETYPES[session.archetype_id] || ARCHETYPES['o-enigma-magnetico'];

  return res.json({
    sessionId: session.id,
    firstName: session.first_name,
    status: session.status,
    paidAt: session.paid_at,
    token: session.access_token,
    archetype: {
      id: archetype.id,
      title: archetype.title,
      tagline: archetype.tagline,
      badge: archetype.badge,
      scores: archetype.scores,
      freePreview: archetype.free_preview,
      fullDossier: archetype.full_dossier
    }
  });
}

/**
 * Conexão de Server-Sent Events (SSE) para atualização instantânea
 */
export async function streamStatus(req, res) {
  const { sessionId } = req.params;

  try {
    const session = await getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sessão não encontrada.' });
    }

    if (session.status === 'APPROVED') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.write(`event: payment_approved\ndata: ${JSON.stringify({ status: 'APPROVED', token: session.access_token })}\n\n`);
      return res.end();
    }

    sseBroker.register(sessionId, res);
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao abrir stream SSE:', err);
    return res.status(500).json({ error: 'Erro interno na conexão em tempo real.' });
  }
}

/**
 * Recuperação de Dossiê por E-mail
 */
export async function recoverDossier(req, res) {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Forneça um e-mail válido para busca.' });
  }

  try {
    const sessions = await getPaidSessionsByEmail(email);
    if (!sessions || sessions.length === 0) {
      return res.status(404).json({
        error: 'Nenhum relatório pago encontrado para o e-mail informado nos últimos 30 dias.'
      });
    }

    return res.json({
      found: true,
      sessions: sessions.map(s => ({
        id: s.id,
        firstName: s.first_name,
        paidAt: s.paid_at
      }))
    });
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao recuperar dossiê:', err);
    return res.status(500).json({ error: 'Erro interno ao consultar recuperação.' });
  }
}

/**
 * Download direto do PDF do Dossiê Completo em alta resolução
 */
export async function downloadDossierPdf(req, res) {
  try {
    const session = req.quizSession;
    const archetype = ARCHETYPES[session.archetype_id] || ARCHETYPES['o-enigma-magnetico'];

    const pdfBuffer = await generateDossierPdf({
      firstName: session.first_name,
      archetype,
      sessionId: session.id
    });

    const safeName = (session.first_name || 'Oficial').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Dossie-Percepcao-Social-${safeName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    console.error('[QUIZ_CONTROLLER] Erro ao gerar PDF para download:', err);
    return res.status(500).json({ error: 'Erro interno ao gerar arquivo PDF.' });
  }
}
