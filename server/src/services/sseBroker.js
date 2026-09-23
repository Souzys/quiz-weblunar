import { EventEmitter } from 'events';

class SSEBroker extends EventEmitter {
  constructor() {
    super();
    // Armazena conexões ativas por sessionId: Map<sessionId, Set<res>>
    this.clients = new Map();
  }

  /**
   * Registra um cliente HTTP na stream SSE
   */
  register(sessionId, res) {
    if (!this.clients.has(sessionId)) {
      this.clients.set(sessionId, new Set());
    }
    const sessionClients = this.clients.get(sessionId);
    sessionClients.add(res);

    // Envia cabeçalhos SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Desabilita buffering no Nginx
    res.flushHeaders?.();

    // Envia evento inicial de conexão estabelecida
    res.write(`event: connected\ndata: ${JSON.stringify({ sessionId, timestamp: Date.now() })}\n\n`);

    // Keep-alive heartbeat a cada 15 segundos para manter a conexão aberta em proxies móveis
    const heartbeat = setInterval(() => {
      try {
        res.write(': keep-alive\n\n');
      } catch (err) {
        clearInterval(heartbeat);
      }
    }, 15000);

    // Remove cliente ao fechar conexão
    res.on('close', () => {
      clearInterval(heartbeat);
      sessionClients.delete(res);
      if (sessionClients.size === 0) {
        this.clients.delete(sessionId);
      }
    });
  }

  /**
   * Notifica todos os clientes conectados a uma sessão que o pagamento foi aprovado
   */
  notifyPaymentApproved(sessionId, data) {
    const sessionClients = this.clients.get(sessionId);
    if (!sessionClients || sessionClients.size === 0) {
      return false;
    }

    const payload = JSON.stringify({
      status: 'APPROVED',
      token: data.token,
      timestamp: Date.now()
    });

    for (const res of sessionClients) {
      try {
        res.write(`event: payment_approved\ndata: ${payload}\n\n`);
        // Fecha conexão após notificar sucesso
        setTimeout(() => {
          try {
            res.end();
          } catch (e) {}
        }, 1000);
      } catch (err) {
        console.error(`[SSE] Erro ao enviar evento para sessão ${sessionId}:`, err.message);
      }
    }

    this.clients.delete(sessionId);
    return true;
  }
}

export const sseBroker = new SSEBroker();
