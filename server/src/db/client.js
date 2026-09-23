import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let isPostgres = false;

// Fallback local em JSON caso DATABASE_URL ainda não esteja preenchida
const localDbPath = path.join(__dirname, '../../../quiz_local_db.json');

function initLocalDb() {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ sessions: {}, webhook_events: {} }, null, 2));
  }
}

function readLocalDb() {
  initLocalDb();
  try {
    const data = fs.readFileSync(localDbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { sessions: {}, webhook_events: {} };
  }
}

function writeLocalDb(data) {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
}

// Inicializa conexão Postgres se DATABASE_URL estiver configurada
if (env.DATABASE_URL && env.DATABASE_URL.trim() !== '') {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes('neon.tech') || env.DATABASE_URL.includes('sslmode=require') 
        ? { rejectUnauthorized: false } 
        : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    isPostgres = true;
    console.log('[DB] Conectado ao PostgreSQL (Neon Pooler ativo).');
  } catch (err) {
    console.warn('[DB] Falha ao conectar ao PostgreSQL, usando fallback local:', err.message);
    isPostgres = false;
  }
} else {
  console.log('[DB] DATABASE_URL não definida. Modo de desenvolvimento local ativado (Persistência Local JSON).');
  initLocalDb();
}

/**
 * Cria as tabelas necessárias no PostgreSQL
 */
export async function runMigrations() {
  if (!isPostgres || !pool) {
    console.log('[DB] Migrações ignoradas no modo de persistência local.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS quiz_sessions (
        id UUID PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        archetype_id VARCHAR(50),
        answers JSONB NOT NULL,
        status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
        mp_payment_id VARCHAR(100),
        pix_qr_code TEXT,
        pix_copy_paste TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        paid_at TIMESTAMP WITH TIME ZONE,
        access_token VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS webhook_events (
        id SERIAL PRIMARY KEY,
        mp_payment_id VARCHAR(100) UNIQUE NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_status ON quiz_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_sessions_email ON quiz_sessions(email);
    `);
    console.log('[DB] Migrações executadas com sucesso no PostgreSQL.');
  } catch (err) {
    console.error('[DB] Erro ao executar migrações:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Cria uma nova sessão de quiz
 */
export async function createSession(sessionData) {
  const {
    id,
    first_name,
    email = null,
    archetype_id,
    answers,
    status = 'PENDING_PAYMENT',
    expires_at,
    access_token = null
  } = sessionData;

  if (isPostgres && pool) {
    const query = `
      INSERT INTO quiz_sessions (id, first_name, email, archetype_id, answers, status, expires_at, access_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [id, first_name, email, archetype_id, JSON.stringify(answers), status, expires_at, access_token];
    const res = await pool.query(query, values);
    return res.rows[0];
  } else {
    const db = readLocalDb();
    const session = {
      id,
      first_name,
      email,
      archetype_id,
      answers,
      status,
      mp_payment_id: null,
      pix_qr_code: null,
      pix_copy_paste: null,
      expires_at: new Date(expires_at).toISOString(),
      paid_at: null,
      access_token,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.sessions[id] = session;
    writeLocalDb(db);
    return session;
  }
}

/**
 * Busca sessão por ID
 */
export async function getSession(id) {
  if (isPostgres && pool) {
    const res = await pool.query('SELECT * FROM quiz_sessions WHERE id = $1', [id]);
    return res.rows[0] || null;
  } else {
    const db = readLocalDb();
    return db.sessions[id] || null;
  }
}

/**
 * Atualiza dados do Pix gerado na sessão
 */
export async function updateSessionPix(id, { mp_payment_id, pix_qr_code, pix_copy_paste, email }) {
  if (isPostgres && pool) {
    const query = `
      UPDATE quiz_sessions
      SET mp_payment_id = $2, pix_qr_code = $3, pix_copy_paste = $4, email = COALESCE($5, email), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const res = await pool.query(query, [id, mp_payment_id, pix_qr_code, pix_copy_paste, email]);
    return res.rows[0];
  } else {
    const db = readLocalDb();
    if (!db.sessions[id]) return null;
    db.sessions[id].mp_payment_id = mp_payment_id;
    db.sessions[id].pix_qr_code = pix_qr_code;
    db.sessions[id].pix_copy_paste = pix_copy_paste;
    if (email) db.sessions[id].email = email;
    db.sessions[id].updated_at = new Date().toISOString();
    writeLocalDb(db);
    return db.sessions[id];
  }
}

/**
 * Marca sessão como paga
 */
export async function markSessionPaid(id, { access_token, mp_payment_id = null }) {
  if (isPostgres && pool) {
    const query = `
      UPDATE quiz_sessions
      SET status = 'APPROVED', paid_at = NOW(), access_token = $2, 
          mp_payment_id = COALESCE($3, mp_payment_id), updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
    const res = await pool.query(query, [id, access_token, mp_payment_id]);
    return res.rows[0];
  } else {
    const db = readLocalDb();
    if (!db.sessions[id]) return null;
    db.sessions[id].status = 'APPROVED';
    db.sessions[id].paid_at = new Date().toISOString();
    db.sessions[id].access_token = access_token;
    if (mp_payment_id) db.sessions[id].mp_payment_id = mp_payment_id;
    db.sessions[id].updated_at = new Date().toISOString();
    writeLocalDb(db);
    return db.sessions[id];
  }
}

/**
 * Verifica se um webhook já foi processado (Idempotência)
 */
export async function isWebhookEventProcessed(mpPaymentId) {
  if (isPostgres && pool) {
    const res = await pool.query('SELECT 1 FROM webhook_events WHERE mp_payment_id = $1', [String(mpPaymentId)]);
    return res.rowCount > 0;
  } else {
    const db = readLocalDb();
    return !!db.webhook_events[String(mpPaymentId)];
  }
}

/**
 * Registra evento de webhook processado
 */
export async function recordWebhookEvent(mpPaymentId, eventType, payload) {
  if (isPostgres && pool) {
    try {
      await pool.query(
        'INSERT INTO webhook_events (mp_payment_id, event_type, payload) VALUES ($1, $2, $3)',
        [String(mpPaymentId), eventType, JSON.stringify(payload)]
      );
      return true;
    } catch (err) {
      // Violação de chave única = já processado
      if (err.code === '23505') return false;
      throw err;
    }
  } else {
    const db = readLocalDb();
    if (db.webhook_events[String(mpPaymentId)]) return false;
    db.webhook_events[String(mpPaymentId)] = {
      event_type: eventType,
      payload,
      created_at: new Date().toISOString()
    };
    writeLocalDb(db);
    return true;
  }
}

/**
 * Busca sessões pagas por e-mail (para recuperação)
 */
export async function getPaidSessionsByEmail(email) {
  if (!email) return [];
  const cleanEmail = email.trim().toLowerCase();

  if (isPostgres && pool) {
    const res = await pool.query(
      "SELECT id, first_name, archetype_id, status, paid_at FROM quiz_sessions WHERE LOWER(email) = $1 AND status = 'APPROVED' ORDER BY paid_at DESC",
      [cleanEmail]
    );
    return res.rows;
  } else {
    const db = readLocalDb();
    return Object.values(db.sessions).filter(
      s => s.email && s.email.trim().toLowerCase() === cleanEmail && s.status === 'APPROVED'
    );
  }
}
