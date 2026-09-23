const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Inicia o quiz enviando respostas e primeiro nome
  async startQuiz(firstName, answers) {
    const res = await fetch(`${API_BASE}/quiz/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, answers })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao iniciar o teste.');
    }
    return res.json();
  },

  // Consulta tempo restante do servidor (Server-Side Timer)
  async getTimeLeft(sessionId) {
    const res = await fetch(`${API_BASE}/quiz/time-left/${sessionId}`);
    if (!res.ok) throw new Error('Falha ao consultar tempo restante.');
    return res.json();
  },

  // Consulta status público da sessão (para fallback de polling)
  async getStatus(sessionId) {
    const res = await fetch(`${API_BASE}/quiz/status/${sessionId}`);
    if (!res.ok) throw new Error('Falha ao checar status da sessão.');
    return res.json();
  },

  // Gera cobrança Pix via Mercado Pago
  async generatePix(sessionId, email) {
    const res = await fetch(`${API_BASE}/payment/pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao gerar cobrança Pix.');
    }
    return res.json();
  },

  // Renova Pix expirado em 1 clique
  async refreshPix(sessionId) {
    const res = await fetch(`${API_BASE}/payment/refresh-pix/${sessionId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao renovar código Pix.');
    }
    return res.json();
  },

  // Simula pagamento aprovado (apenas em dev)
  async simulatePayment(sessionId) {
    const res = await fetch(`${API_BASE}/payment/simulate/${sessionId}`, {
      method: 'POST'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao simular aprovação.');
    }
    return res.json();
  },

  // Recupera dossiê por e-mail
  async recoverDossier(email) {
    const res = await fetch(`${API_BASE}/quiz/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Nenhum resultado encontrado para este e-mail.');
    }
    return res.json();
  },

  // Obtém o dossiê completo (Protegido por token)
  async getDossier(sessionId, token) {
    const headers = {};
    if (token) headers['x-access-token'] = token;

    const res = await fetch(`${API_BASE}/quiz/dossier/${sessionId}`, { headers });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Acesso não liberado para este relatório.');
    }
    return res.json();
  },

  // Link para download direto do PDF oficial vetorial
  getPdfDownloadUrl(sessionId, token) {
    return `${API_BASE}/quiz/download-pdf/${sessionId}?token=${encodeURIComponent(token || '')}`;
  }
};
