# 🔮 Quiz de Alta Conversão

> **Chamada Oficial:**  
> *"Descubra como as pessoas realmente te enxergam (e o traço oculto que você projeta sem perceber)"*

Aplicação web completa, desacoplada e ultra-otimizada para **conversão extrema de compra por impulso (Low Ticket R$ 4,99)** com Checkout Transparente Pix via Mercado Pago, atualização em tempo real por **Server-Sent Events (SSE)**, proteção anti-IDOR e geração de Dossiê Confidencial com suporte a salvamento em PDF nativo.

---

## 🚀 Como Rodar Localmente em 2 Minutos

### 1. Iniciar o Backend (API)
```bash
cd server
npm install
npm run dev
```
*A API iniciará em `http://localhost:3001` com persistência local automática e modo mock ativo para você testar sem precisar pagar Pix de verdade.*

### 2. Iniciar o Frontend (Vite + React)
Em outro terminal:
```bash
cd client
npm install
npm run dev
```
*Abra `http://localhost:5173` no seu navegador (ou no celular via rede local).*

---

## 🧪 Testando o Fluxo Completo (Modo Dev)

1. Clique em **"Iniciar Teste Gratuito"**.
2. Responda as 7 perguntas do quiz.
3. Digite seu primeiro nome (ex: `Lucas`).
4. Veja o **Fake Loading** calibrando a matriz comportamental.
5. Acesse o **Paywall de R$ 4,99** com o timer do servidor ativo e as seções borradas.
6. Clique em **"Liberar Meu Dossiê Completo"** para abrir o modal do Pix.
7. No modal do Pix, clique no botão:  
   👉 **`[DEV] Simular Pagamento Aprovado`**
8. O modal fecha sozinho, a tela explode em confetes e o seu **Dossiê Completo** com os 4 capítulos profundos é liberado instantaneamente!
9. Teste o botão **"Baixar / Imprimir em PDF"** e o botão **"Copiar Link"**.

---

## ⚙️ Configuração para Produção (game.weblunar.com.br)

No arquivo `server/.env`:

```env
PORT=3001
NODE_ENV=production
BASE_URL=https://api-game.weblunar.com.br
FRONTEND_URL=https://game.weblunar.com.br
CORS_ORIGIN=https://game.weblunar.com.br

# 1. Banco de Dados PostgreSQL (Neon Free Tier com Connection Pooling)
DATABASE_URL=postgresql://neondb_owner:SENHA@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# 2. Mercado Pago (Produção)
# Obtenha em: https://www.mercadopago.com.br/developers/panel/app
MP_ACCESS_TOKEN=APP_USR-seu-access-token-de-producao
MP_WEBHOOK_SECRET=seu-webhook-secret-do-painel

# 3. Resend (E-mail Transacional de Backup Gratuito - 3.000/mês)
# Obtenha em: https://resend.com/api-keys
RESEND_API_KEY=re_sua_chave_resend
EMAIL_FROM=Dossiê Pessoal <dossie@weblunar.com.br>
```

### Rodar as Migrações do PostgreSQL no Neon:
```bash
cd server
npm run db:migrate
```

---

## 🌐 Opções de Deploy Recomendadas (Edge-First)

### Opção Recomendada (Custo R$ 0,00 inicial):
1. **Frontend (`client/`):**  
   - Conecte o repositório no **Cloudflare Pages** ou **Vercel** apontando para a pasta `client/`.
   - Adicione a variável de ambiente: `VITE_API_BASE_URL=https://api-game.weblunar.com.br/api`.
   - Aponte o subdomínio `game.weblunar.com.br` para a Vercel/Cloudflare Pages.
2. **Backend (`server/`):**  
   - Suba em uma VPS simples (Hostinger / Hetzner por ~R$ 20/mês) com Node.js + PM2 ou em serviço gerenciado (Render / Railway).
   - Configure o Webhook no Mercado Pago apontando para:  
     `https://api-game.weblunar.com.br/api/webhook/mercadopago`.

---

## 🔒 Pilares de Segurança Implementados
- **Anti-IDOR:** O endpoint `/api/quiz/dossier/:id` valida estritamente o status no banco e exige token de acesso emitido na aprovação.
- **Idempotência no Webhook:** Tabela de eventos com chave única `mp_payment_id` e conferência reversa na API do Mercado Pago para evitar duplicidade ou fraude.
- **Server-Side Timer:** A contagem regressiva de escassez (R$ 4,99 vs R$ 49,90) é sincronizada com o relógio do servidor NTP, imune a F5 ou alteração de relógio do celular.
- **Rate Limiting:** Proteção ativa contra brute-force em endpoints públicos.
