import React from 'react';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2, Zap, BookOpen, Sparkles, KeyRound } from 'lucide-react';
import ServerTimer from '../components/ServerTimer.jsx';

export default function PaywallScreen({
  sessionId,
  firstName,
  archetype,
  onUnlockClick
}) {
  // Pega a métrica dominante do arquétipo
  const primaryScore = archetype?.scores?.magnetism || 92;

  // Dados da Lógica B (Capítulo 1 completo, Capítulo 2 parcial e teasers)
  const chapter1 = archetype?.chapter1 || {
    title: 'Capítulo 1: Como o mundo te lê nos primeiros 30 segundos',
    content: `Quando você entra em um ambiente, a sua linguagem corporal não pede licença e nem busca validação. As pessoas frequentemente interpretam o seu silêncio inicial como desdém, frieza ou superioridade — mas na verdade é apenas o seu radar de autopreservação e escaneamento em funcionamento.
    
Homens e mulheres sentem uma atração magnética porque você não entrega suas cartas logo de cara. Você passa a impressão de alguém que guarda segredos valiosos e que possui uma vida interior muito mais interessante do que o assunto comum da roda.`,
    hook: '...e é justamente essa postura que esconde o traço oculto mais perigoso da sua projeção social — o qual analisamos no Capítulo 2.'
  };

  const chapter2 = archetype?.chapter2_preview || {
    title: 'Capítulo 2: O traço oculto que você projeta sem perceber',
    preview: 'Sem dizer uma única palavra, você projeta o arquétipo do observador soberano. O que você talvez não note é que a sua postura silenciosa faz com que pessoas inseguras se sintam expostas diante de você.'
  };

  const chapter3 = archetype?.chapter3_teaser || {
    title: 'Capítulo 3: O seu ponto cego fatal (Onde você se sabota)',
    teaser: 'O padrão oculto de autoproteção que sabota suas decisões mais promissoras.'
  };

  const chapter4 = archetype?.chapter4_teaser || {
    title: 'Capítulo 4: O Guia de Ativação (3 Passos Estratégicos)'
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-xl mx-auto space-y-6 bg-indigo-gradient text-slate-100">
      
      {/* Topo: Urgência Real de Sessão */}
      <div className="text-center pt-1">
        <ServerTimer sessionId={sessionId} />
        <p className="text-[11px] text-slate-400 mt-1">
          Condição exclusiva reservada para esta sessão ativa.
        </p>
      </div>

      {/* Card do Perfil Detectado */}
      <div className="p-6 rounded-3xl bg-[#12142E] border border-violet-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            {archetype?.badge || 'Arquétipo Pouco Comum'}
          </span>
          <span className="text-xs text-emeraldCta font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1 de 4 Capítulos Desbloqueado
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {firstName}, seu perfil é:{' '}
          <span className="text-transparent bg-clip-text bg-violet-magenta block sm:inline">
            {archetype?.title}
          </span>
        </h1>

        <p className="text-sm text-slate-300 italic mb-5">
          "{archetype?.tagline}"
        </p>

        {/* ÚNICA Métrica em Destaque */}
        <div className="p-4 rounded-2xl bg-[#0D0E1F]/80 border border-indigoBorder flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block">
              Índice de Magnetismo Inconsciente
            </span>
            <span className="text-xs text-skyTrust">Calculado com base nos seus 3 vetores de resposta</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-violet-magenta">
            {primaryScore}%
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LÓGICA B: CAPÍTULO 1 TOTALMENTE LIBERADO (A PROVA DE QUALIDADE) */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-[#12142E] border border-violet-500/40 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-indigoBorder pb-3">
          <div className="flex items-center gap-2 text-violet-400">
            <BookOpen className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {chapter1.title}
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emeraldCta/15 text-emeraldCta border border-emeraldCta/30 shrink-0">
            Leitura Liberada
          </span>
        </div>

        {/* Texto Completo Sem Blur */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {chapter1.content}
        </p>

        {/* Gancho Narrativo de Transição para o Capítulo 2 */}
        {chapter1.hook && (
          <div className="p-3.5 rounded-xl bg-[#0D0E1F] border border-violet-500/30 text-xs sm:text-sm text-violet-200 italic font-medium">
            <span className="text-violet-400 font-bold not-italic">Atenção: </span>
            {chapter1.hook}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* LÓGICA B: CAPÍTULO 2 MEIO LIBERADO / MEIO BLUR (A PONTE)       */}
      {/* ============================================================== */}
      <div className="relative p-6 rounded-3xl bg-[#12142E]/90 border border-indigoBorder shadow-xl overflow-hidden space-y-3">
        <div className="flex items-center justify-between border-b border-indigoBorder pb-3">
          <h3 className="text-base font-bold text-white tracking-tight">
            {chapter2.title}
          </h3>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 shrink-0">
            Parcialmente Bloqueado
          </span>
        </div>

        {/* Primeiro Parágrafo Visível (Amostra Fina) */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {chapter2.preview}
        </p>

        {/* Continuação Borrada com Efeito de Fade */}
        <div className="relative pt-2">
          <p className="filter blur-[5px] select-none text-xs text-slate-400 leading-relaxed opacity-40">
            Muitos sentem como se os seus olhos estivessem enxergando as intenções mais escondidas delas. Isso gera dois efeitos imediatos: pessoas fortes buscam a sua aprovação como um troféu, enquanto pessoas manipuladoras mantêm distância por medo de serem desmascaradas...
          </p>
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-[#12142E]/70 to-[#12142E]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D0E1F] border border-violet-500/40 text-xs font-semibold text-violet-300 shadow-xl">
              <Lock className="w-3.5 h-3.5 text-violet-400" />
              <span>Desfecho do Capítulo 2 trancado no Dossiê Completo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LÓGICA B: CAPÍTULO 3 TOTALMENTE BLOQUEADO (PONTO CEGO FATAL)   */}
      {/* ============================================================== */}
      <div className="p-5 rounded-2xl bg-[#12142E]/60 border border-indigoBorder text-left space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            <h4 className="text-sm font-bold text-white">
              {chapter3.title}
            </h4>
          </div>
          <span className="text-[10px] uppercase font-mono text-slate-400">Capítulo 3</span>
        </div>
        <p className="text-xs text-slate-400 line-clamp-1 italic">
          "{chapter3.teaser}"
        </p>
      </div>

      {/* ============================================================== */}
      {/* LÓGICA B: CAPÍTULO 4 BÔNUS PRÁTICO (O GUIA DE ATIVAÇÃO)        */}
      {/* ============================================================== */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-[#12142E] to-emerald-950/30 border border-emeraldCta/30 text-left space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emeraldCta">
            <KeyRound className="w-4 h-4" />
            <h4 className="text-sm font-bold text-white">
              {chapter4.title}
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold text-emeraldCta bg-emeraldCta/10 px-2 py-0.5 rounded border border-emeraldCta/20">
            Exclusivo no Dossiê
          </span>
        </div>
        <p className="text-xs text-slate-300">
          O roteiro estratégico em 3 passos para calibrar sua linguagem corporal, quebrar barreiras sociais e converter seu arquétipo em magnetismo prático no trabalho e nas relações.
        </p>
      </div>

      {/* ============================================================== */}
      {/* CAIXA DA OFERTA ANCORADA (R$ 4,99)                             */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-[#12142E] border border-violet-500/40 shadow-2xl text-center space-y-4">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold border border-violet-500/30">
          <Zap className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
          <span>CONDIÇÃO PROMOCIONAL DE LANÇAMENTO</span>
        </div>

        <div className="space-y-1">
          <div className="text-slate-400 text-xs">
            Valor normal do dossiê completo: <span className="line-through">R$ 49,90</span>
          </div>
          <div className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>R$ 4,99</span>
            <span className="text-xs font-normal text-emeraldCta px-2 py-0.5 rounded-md bg-emeraldCta/10 border border-emeraldCta/25">
              Valor Promocional
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-sm mx-auto pt-1">
            Você acabou de provar a precisão do Capítulo 1. Libere os Capítulos 2, 3 e o Guia de Ativação pelo valor simbólico de lançamento.
          </p>
        </div>

        {/* CTA PRINCIPAL: Verde-Esmeralda Único (Efeito Von Restorff) */}
        <button
          onClick={onUnlockClick}
          className="w-full py-4 px-6 rounded-2xl bg-emeraldCta hover:bg-emeraldCtaHover text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all duration-300 active:scale-98"
        >
          <span>Desbloquear meu dossiê completo</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Microcopy Reforçado em Linha Única */}
        <p className="text-xs text-slate-300 pt-1">
          Acesso imediato na tela · Pix seguro e criptografado · Sem assinatura
        </p>

        {/* Selos de Confiança em Azul-Petróleo */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-skyTrust pt-1">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Liberação Instantânea
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Pix Seguro via Mercado Pago
          </span>
        </div>
      </div>

    </div>
  );
}
