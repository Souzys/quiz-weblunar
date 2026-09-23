import React, { useState } from 'react';
import { QrCode, Copy, Check, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

export default function PixModal({
  isOpen,
  onClose,
  sessionId,
  pixData,
  onPixGenerated,
  onPixUpdated,
  isExpired,
  onSimulateSuccess
}) {
  const [emailInput, setEmailInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [emailError, setEmailError] = useState(null);

  if (!isOpen) return null;

  // Submissão do e-mail para gerar o Pix
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@') || !emailInput.includes('.')) {
      setEmailError('Por favor, informe um e-mail válido para receber seu relatório.');
      return;
    }

    setGenerating(true);
    setEmailError(null);

    try {
      const pix = await api.generatePix(sessionId, emailInput.trim());
      onPixGenerated(pix);
    } catch (err) {
      setEmailError(err.message || 'Erro ao gerar Pix no momento. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (pixData?.qrCodeCopyPaste) {
        await navigator.clipboard.writeText(pixData.qrCodeCopyPaste);
        if (typeof navigator.vibrate === 'function') {
          navigator.vibrate(50);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  const handleRefreshPix = async () => {
    setRefreshing(true);
    try {
      const refreshed = await api.refreshPix(sessionId);
      onPixUpdated(refreshed);
    } catch (err) {
      alert('Erro ao renovar código Pix. Tente novamente.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await api.simulatePayment(sessionId);
      if (onSimulateSuccess) {
        onSimulateSuccess(res.token);
      }
    } catch (err) {
      alert('Falha ao simular pagamento.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#12142E] border border-indigoBorder rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 my-8">
        
        {/* ============================================================== */}
        {/* ETAPA 1: SE O PIX AINDA NÃO FOI GERADO -> PEDIR O E-MAIL       */}
        {/* ============================================================== */}
        {!pixData ? (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-violet-400 mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Onde devemos enviar seu Dossiê?
              </h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Enviaremos uma via de segurança permanente do seu relatório caso a conexão oscile.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Seu Melhor E-mail:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3.5 bg-[#0D0E1F] border border-indigoBorder focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                />
              </div>

              {emailError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full py-4 px-6 rounded-2xl bg-emeraldCta hover:bg-emeraldCtaHover text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <span>{generating ? 'Gerando Pix...' : 'Continuar para o Pix (R$ 4,99)'}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-skyTrust text-xs text-center border-t border-indigoBorder pt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero spam • Apenas o link oficial do seu Dossiê</span>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* ETAPA 2: PIX JÁ GERADO -> MOSTRAR QR CODE + COPIA E COLA       */
          /* ============================================================== */
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emeraldCta/10 border border-emeraldCta/25 text-emeraldCta mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Pagamento Instantâneo via Pix
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Liberação imediata na tela do seu Dossiê
              </p>
              <div className="mt-2.5 inline-block bg-[#0D0E1F] border border-violet-500/30 px-4 py-1 rounded-full text-violet-300 font-bold text-base">
                R$ 4,99 <span className="text-xs font-normal text-slate-400 line-through ml-1">R$ 49,90</span>
              </div>
            </div>

            {/* Estado: Pix Expirado */}
            {isExpired ? (
              <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl text-center mb-4">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
                <h4 className="font-semibold text-rose-200">Este código Pix expirou</h4>
                <p className="text-xs text-rose-300/80 mt-1 mb-3">
                  Não se preocupe, suas respostas continuam salvas.
                </p>
                <button
                  onClick={handleRefreshPix}
                  disabled={refreshing}
                  className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Gerando novo código...' : 'Gerar Novo Código Pix'}
                </button>
              </div>
            ) : (
              <>
                {/* QR Code Visual */}
                {pixData.qrCodeBase64 && (
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix"
                        className="w-40 h-40 object-contain"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;base64,${pixData.qrCodeBase64}`;
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Botão Principal: Copiar Código Pix (Verde Esmeralda) */}
                <div className="mb-4">
                  <button
                    onClick={handleCopy}
                    className={`w-full py-4 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95 ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-emeraldCta hover:bg-emeraldCtaHover text-slate-950 shadow-emerald-500/25'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>Código Pix Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 stroke-[2.5]" />
                        <span>Copiar Código Pix (Copia e Cola)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status em Tempo Real / Radar */}
                <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-[#0D0E1F] border border-indigoBorder text-slate-300 text-xs text-center mb-4">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emeraldCta opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emeraldCta"></span>
                  </span>
                  <span>Aguardando pagamento. A página atualizará sozinha em segundos!</span>
                </div>

                {/* Instruções Rápidas */}
                <div className="bg-[#0D0E1F]/60 border border-indigoBorder rounded-xl p-3 mb-4 text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-white">Como pagar:</p>
                  <p>1. Copie o código no botão verde acima.</p>
                  <p>2. Abra o app do seu banco e escolha <strong>Pix Copia e Cola</strong>.</p>
                  <p>3. Pague os <strong>R$ 4,99</strong> e o dossiê abrirá aqui automaticamente!</p>
                </div>
              </>
            )}

            {/* Garantia & Segurança em Azul-Petróleo */}
            <div className="flex items-center justify-center gap-2 text-skyTrust text-xs text-center border-t border-indigoBorder pt-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Pagamento 100% Criptografado via Mercado Pago</span>
            </div>

            {/* MODO DEV: Botão de Simulação de Pagamento */}
            <div className="mt-3 pt-2 border-t border-dashed border-violet-900/50 text-center">
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="text-xs text-violet-400 hover:text-violet-300 underline inline-flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {simulating ? 'Simulando aprovação...' : '[DEV] Simular Pagamento Aprovado'}
              </button>
            </div>
          </div>
        )}

        {/* Fechar modal */}
        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          Voltar para a análise
        </button>

      </div>
    </div>
  );
}
