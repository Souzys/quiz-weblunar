import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Printer,
  Share2,
  Check,
  ShieldCheck,
  Eye,
  Crosshair,
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Quote,
  Info,
  Download,
  MailCheck
} from 'lucide-react';
import { api } from '../services/api.js';

const ARCHETYPE_PULL_QUOTES = {
  'o-enigma-magnetico': {
    q1: 'O seu silêncio inicial não pede licença e nem busca validação — ele funciona como um radar de autopreservação que atrai e intimida ao mesmo tempo.',
    q2: 'Pessoas fortes buscam a sua aprovação como um troféu, enquanto pessoas manipuladoras mantêm distância por medo de serem desmascaradas.',
    q3: 'O seu maior escudo é também a sua maior prisão: a aversão à vulnerabilidade faz você cortar laços exatamente no momento em que a relação se aprofundaria.'
  },
  'o-estrategista-silencioso': {
    q1: 'Enquanto os outros reagem ao calor do momento, sua calma imperturbável transmite uma autoridade racional nata que ninguém consegue ignorar.',
    q2: 'Pessoas que tentam usar artifícios manipuladores sentem desconforto imediato, porque percebem que você desmembra narrativas com a precisão de um bisturi.',
    q3: 'Centralizar tudo por achar que ninguém fará direito não é liderança — é uma armadilha de hipervigilância que drena sua energia mental.'
  },
  'o-farol-empatico': {
    q1: 'Sua presença é sentida antes das palavras: você emana um calor onde as defesas das pessoas simplesmente desmoronam.',
    q2: 'Você projeta o arquétipo do Santuário Inesgotável, atraindo quem busca descarregar lixo emocional sem oferecer reciprocidade.',
    q3: 'Você sabota suas próprias ambições porque sempre prioriza apagar os incêndios alheios antes de construir o seu próprio castelo.'
  },
  'o-visionario-instintivo': {
    q1: 'Você projeta energia crua de tração e coragem: projetos travados há meses ganham velocidade vertiginosa quando você assume o comando.',
    q2: 'O que para você é compromisso com o resultado é interpretado por pessoas mais frágeis como pressão sufocante.',
    q3: 'Queimar pontes no calor do orgulho custa caro: use a frieza de um cirurgião antes de disparar verdades que rompem laços estratégicos.'
  }
};

export default function DossierScreen({ dossierData }) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, []);

  if (!dossierData) return null;

  const { firstName, archetype, sessionId } = dossierData;
  const { fullDossier, scores } = archetype;
  const quotes = ARCHETYPE_PULL_QUOTES[archetype.id] || ARCHETYPE_PULL_QUOTES['o-enigma-magnetico'];

  const emissionDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dossierCode = (sessionId || 'WEBLUNAR').substring(0, 8).toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {}
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Fiz o teste de percepção social e meu perfil é ${archetype.title}! Veja o seu teste aqui: https://game.weblunar.com.br`
  )}`;

  return (
    <div className="dossier-wrapper min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-6 bg-indigo-gradient text-slate-100 print:max-w-none print:w-[210mm] print:m-0 print:p-0 print:space-y-0">
      
      {/* =======================================================
          BARRA DE AÇÕES SUPERIOR (SÓ NA TELA, OCULTA NO PDF)
          ======================================================= */}
      <div className="no-print space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#12142E] border border-emeraldCta/30 shadow-2xl">
          <div className="flex items-center gap-2 text-emeraldCta text-xs sm:text-sm font-bold">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Dossiê Liberado & Acesso Confirmado!</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={api.getPdfDownloadUrl(sessionId, dossierData?.token)}
              download={`Dossie-Percepcao-Social-${firstName || 'Oficial'}.pdf`}
              className="py-2.5 px-4 bg-emeraldCta hover:bg-emeraldCtaHover text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Baixar PDF Oficial</span>
            </a>
            <button
              onClick={handlePrint}
              className="py-2 px-3 bg-[#0D0E1F] hover:bg-[#181a3d] text-slate-200 border border-indigoBorder rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Imprimir ou salvar via navegador"
            >
              <Printer className="w-3.5 h-3.5 text-violet-400" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="py-2 px-3 bg-[#0D0E1F] hover:bg-[#181a3d] text-slate-200 border border-indigoBorder rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emeraldCta" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Compartilhar'}</span>
            </button>
          </div>
        </div>

        {/* Notificação de Envio por E-mail */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
          <MailCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>O arquivo <strong>PDF oficial</strong> também foi <strong>anexado e enviado diretamente para o seu e-mail</strong> cadastrado.</span>
        </div>
      </div>

      {/* =======================================================
          PÁGINA 1 DO PDF: CAPA DE ALTO LUXO & GRÁFICOS VISUAIS
          ======================================================= */}
      <section className="print-page w-full p-6 sm:p-10 rounded-3xl print:rounded-none bg-[#12142E] border border-violet-500/40 print:border-none shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Glow decorativo de fundo (oculto no print para manter texto nítido) */}
        <div className="no-print absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="no-print absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo da Capa: Identificação Institucional e Sigilo */}
        <div className="w-full border-b border-indigoBorder/80 pb-5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-violet-400 font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" /> WebLunar Analytics
            </span>
            <span className="px-2.5 py-1 rounded bg-[#0D0E1F] border border-indigoBorder text-skyTrust font-bold">
              CÓD: {dossierCode}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
            <span>DOCUMENTO CONFIDENCIAL • CLASSIFICAÇÃO DE TEMPERAMENTO</span>
            <span>EMISSÃO: {emissionDate}</span>
          </div>
        </div>

        {/* Bloco Central da Capa: Título, Nome e Arquétipo */}
        <div className="w-full my-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
            {archetype.badge || 'Arquétipo Pouco Comum'}
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 block">
              Relatório Individual de:
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {firstName}
            </h1>
          </div>

          <div className="w-full p-5 rounded-2xl bg-[#0D0E1F] border border-violet-500/30 space-y-2 box-border">
            <span className="text-[10px] uppercase font-mono text-skyTrust tracking-widest block font-bold">
              Arquétipo Dominante Identificado
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-violet-magenta">
              {archetype.title}
            </h2>
            <p className="text-sm text-slate-300 italic">
              "{archetype.tagline}"
            </p>
          </div>
        </div>

        {/* GRÁFICO VISUAL DOS 4 EIXOS (Barras Horizontais com Gradiente) */}
        {scores && (
          <div className="w-full p-5 sm:p-6 rounded-2xl bg-[#0D0E1F] border border-indigoBorder space-y-4 my-2 box-border">
            <div className="flex items-center justify-between border-b border-indigoBorder/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Matriz de Vetores Psicológicos
              </span>
              <span className="text-[10px] font-mono text-violet-400">4 Dimensões Analisadas</span>
            </div>

            {/* Eixo 1: Magnetismo */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Magnetismo Inconsciente</span>
                <span className="text-violet-400 font-bold font-mono">{scores.magnetism}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                  style={{ width: `${scores.magnetism}%` }}
                />
              </div>
            </div>

            {/* Eixo 2: Intimidação */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Projeção de Intimidação / Soberania</span>
                <span className="text-fuchsia-400 font-bold font-mono">{scores.intimidation}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-rose-500 rounded-full"
                  style={{ width: `${scores.intimidation}%` }}
                />
              </div>
            </div>

            {/* Eixo 3: Profundidade */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Profundidade Perceptiva (Radar)</span>
                <span className="text-skyTrust font-bold font-mono">{scores.depth}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                  style={{ width: `${scores.depth}%` }}
                />
              </div>
            </div>

            {/* Eixo 4: Acessibilidade */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Acessibilidade Social Imediata</span>
                <span className="text-emeraldCta font-bold font-mono">{scores.accessibility}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                  style={{ width: `${scores.accessibility}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Rodapé da Capa */}
        <div className="w-full pt-4 border-t border-indigoBorder/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Relatório restrito ao titular. Proibida reprodução não autorizada.</span>
          <span className="font-mono text-violet-400 font-bold">PÁGINA 1 DE 3</span>
        </div>
      </section>

      {/* =======================================================
          PÁGINA 2 DO PDF: CAPÍTULO 1 & CAPÍTULO 2 COM PULL QUOTES
          ======================================================= */}
      <section className="print-page w-full p-6 sm:p-10 rounded-3xl print:rounded-none bg-[#12142E] border border-indigoBorder print:border-none shadow-xl space-y-6">
        
        {/* Cabeçalho da Página Interna */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-indigoBorder/80 pb-3">
          <span className="text-violet-400 font-bold">WEBLUNAR PSICO-ANÁLISE • DOSSIÊ CONFIDENCIAL</span>
          <span>CÓD: {dossierCode} • PÁG 02</span>
        </div>

        {/* CAPÍTULO 1 */}
        <div className="page-break-avoid w-full space-y-3">
          <div className="flex items-center gap-2.5 text-violet-400">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {fullDossier.chapter1_first_impression.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line text-justify">
            {fullDossier.chapter1_first_impression.content}
          </p>

          {/* Pull Quote de Impacto do Capítulo 1 */}
          <div className="w-full p-3.5 rounded-xl bg-[#0D0E1F] border-l-4 border-violet-500 flex gap-3 my-2 shadow box-border">
            <Quote className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-violet-200 italic leading-snug">
              "{quotes.q1}"
            </p>
          </div>
        </div>

        {/* Divisor Estético */}
        <div className="w-full border-t border-indigoBorder/60 my-2" />

        {/* CAPÍTULO 2 */}
        <div className="page-break-avoid w-full space-y-3">
          <div className="flex items-center gap-2.5 text-fuchsia-400">
            <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/25 flex items-center justify-center shrink-0">
              <Crosshair className="w-4 h-4 text-fuchsia-400" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {fullDossier.chapter2_hidden_trait.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line text-justify">
            {fullDossier.chapter2_hidden_trait.content}
          </p>

          {/* Pull Quote de Impacto do Capítulo 2 */}
          <div className="w-full p-3.5 rounded-xl bg-[#0D0E1F] border-l-4 border-fuchsia-500 flex gap-3 my-2 shadow box-border">
            <Quote className="w-5 h-5 text-fuchsia-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-fuchsia-200 italic leading-snug">
              "{quotes.q2}"
            </p>
          </div>
        </div>

        {/* Rodapé da Página 2 */}
        <div className="w-full pt-4 border-t border-indigoBorder/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Dossiê Comportamental • {firstName}</span>
          <span className="font-mono text-violet-400 font-bold">PÁGINA 2 DE 3</span>
        </div>
      </section>

      {/* =======================================================
          PÁGINA 3 DO PDF: CAPÍTULO 3 & GUIA DE ATIVAÇÃO PRÁTICA
          ======================================================= */}
      <section className="print-page-last w-full p-6 sm:p-10 rounded-3xl print:rounded-none bg-[#12142E] border border-indigoBorder print:border-none shadow-xl space-y-5">
        
        {/* Cabeçalho da Página Interna */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-indigoBorder/80 pb-3">
          <span className="text-violet-400 font-bold">WEBLUNAR PSICO-ANÁLISE • DOSSIÊ CONFIDENCIAL</span>
          <span>CÓD: {dossierCode} • PÁG 03</span>
        </div>

        {/* CAPÍTULO 3 */}
        <div className="page-break-avoid w-full space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {fullDossier.chapter3_blind_spot.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line text-justify">
            {fullDossier.chapter3_blind_spot.content}
          </p>

          {/* Pull Quote de Impacto do Capítulo 3 */}
          <div className="w-full p-3.5 rounded-xl bg-[#0D0E1F] border-l-4 border-amber-500 flex gap-3 my-2 shadow box-border">
            <Quote className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold text-amber-200 italic leading-snug">
              "{quotes.q3}"
            </p>
          </div>
        </div>

        {/* Divisor Estético */}
        <div className="w-full border-t border-indigoBorder/60 my-1" />

        {/* CAPÍTULO 4: GUIA DE ATIVAÇÃO PRÁTICA (3 PASSOS) */}
        <div className="page-break-avoid w-full space-y-3">
          <div className="flex items-center gap-2 text-emeraldCta">
            <Lightbulb className="w-5 h-5 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {fullDossier.chapter4_activation_key.title}
            </h2>
          </div>

          <div className="space-y-2.5 w-full">
            {fullDossier.chapter4_activation_key.steps.map((step, idx) => (
              <div key={idx} className="w-full p-3.5 rounded-xl bg-[#0D0E1F] border border-indigoBorder space-y-1 box-border">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{step.name}</h4>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed pl-7 text-justify">
                  {step.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* PÁGINA DE ENCERRAMENTO & MARCA (VIRAL LOOP) */}
        <div className="page-break-avoid w-full p-4 rounded-2xl bg-[#0D0E1F] border border-violet-500/30 text-center space-y-2 mt-4 box-border">
          <div className="flex items-center justify-center gap-2 text-skyTrust text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emeraldCta" />
            <span>Diagnóstico Comportamental Concluído</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Descubra o perfil das pessoas ao seu redor. Convide amigos ou parceiros para o teste:
          </p>
          <span className="inline-block px-3 py-1 rounded-full bg-[#12142E] text-violet-300 text-xs font-mono font-bold border border-violet-500/30">
            game.weblunar.com.br
          </span>
        </div>

        {/* Rodapé da Página Final */}
        <div className="w-full pt-3 border-t border-indigoBorder/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>© WebLunar • Todos os direitos reservados.</span>
          <span className="font-mono text-violet-400 font-bold">PÁGINA 3 DE 3</span>
        </div>
      </section>

      {/* =======================================================
          AÇÕES FINAIS (SÓ NA TELA, OCULTAS NA IMPRESSÃO)
          ======================================================= */}
      <div className="no-print pt-4 pb-8 space-y-3 text-center">
        <button
          onClick={handlePrint}
          className="w-full py-4 px-6 rounded-2xl bg-emeraldCta hover:bg-emeraldCtaHover text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Printer className="w-5 h-5 stroke-[2.5]" />
          <span>Baixar / Salvar Meu Dossiê em PDF</span>
        </button>

        <a
          href={whatsappShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#12142E] hover:bg-[#181a3d] border border-emeraldCta/40 text-emeraldCta font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Compartilhar Resultado no WhatsApp</span>
        </a>

        <p className="text-xs text-slate-400 pt-2">
          Recomendamos salvar em PDF no seu celular para acesso offline a qualquer momento.
        </p>
      </div>

    </div>
  );
}
