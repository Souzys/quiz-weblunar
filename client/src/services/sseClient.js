import { api } from './api.js';

export function listenPaymentStatus({ sessionId, onApproved, onError }) {
  let eventSource = null;
  let isApproved = false;
  let pollInterval = null;
  let pollAttempts = 0;

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // 1. Tenta conectar via Server-Sent Events (SSE)
  if (typeof EventSource !== 'undefined') {
    try {
      eventSource = new EventSource(`${API_BASE}/quiz/stream/${sessionId}`);

      eventSource.addEventListener('payment_approved', (e) => {
        try {
          const data = JSON.parse(e.data);
          isApproved = true;
          cleanup();
          onApproved(data.token);
        } catch (err) {
          console.error('[SSE] Erro ao processar evento:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.warn('[SSE] Conexão oscilou, ativando fallback resiliente de polling...');
        eventSource.close();
        eventSource = null;
        startPollingFallback();
      };
    } catch (e) {
      startPollingFallback();
    }
  } else {
    startPollingFallback();
  }

  // 2. Fallback de Polling Inteligente com Backoff Exponencial
  function startPollingFallback() {
    if (pollInterval || isApproved) return;

    const poll = async () => {
      if (isApproved) return;
      pollAttempts++;

      try {
        const res = await api.getStatus(sessionId);
        if (res.status === 'APPROVED') {
          isApproved = true;
          cleanup();
          onApproved(res.token);
          return;
        }
      } catch (err) {
        console.warn('[POLLING] Falha na consulta de status:', err.message);
      }

      // Intervalo com Backoff inteligente:
      // Primeiros 30s: 3 segundos
      // De 30s a 2min: 5 segundos
      // Acima de 2min: 8 segundos
      let delay = 3000;
      if (pollAttempts > 10) delay = 5000;
      if (pollAttempts > 25) delay = 8000;

      pollInterval = setTimeout(poll, delay);
    };

    pollInterval = setTimeout(poll, 2500);
  }

  function cleanup() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollInterval) {
      clearTimeout(pollInterval);
      pollInterval = null;
    }
  }

  return { cleanup };
}
