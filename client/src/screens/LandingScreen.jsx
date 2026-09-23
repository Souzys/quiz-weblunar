import React from 'react';
import { ArrowRight, Eye, ShieldCheck, Clock, BrainCircuit } from 'lucide-react';

export default function LandingScreen({ onStart, onOpenRecovery }) {
  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-8 max-w-xl mx-auto bg-indigo-gradient text-slate-100">
      
      {/* Topo / Selo de Autoridade Honesto */}
      <header className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-6">
          <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
          <span>Baseado em modelos de personalidade e psicologia comportamental</span>
        </div>

        {/* Headline com abertura de loop cognitivo */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Você já percebeu como as pessoas te leem em 3 segundos —{' '}
          <span className="text-transparent bg-clip-text bg-violet-magenta block mt-1">
            mas nunca soube exatamente o quê elas veem?
          </span>
        </h1>

        {/* Subtítulo refinado */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8">
          Um teste comportamental de 2 minutos revela o padrão que você transmite sem perceber — e o ponto cego que só os outros enxergam.
        </p>

        {/* Card de Chamada / Ilustração Visual */}
        <div className="p-5 rounded-2xl bg-[#12142E]/80 border border-indigoBorder shadow-2xl mb-8 text-left relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">O que você vai decodificar:</h3>
              <p className="text-xs text-slate-400">Análise precisa de percepção inconsciente</p>
            </div>
          </div>

          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
              <span>A primeira impressão exata que você causa nos primeiros 30 segundos</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1 shrink-0" />
              <span>O sinal silencioso que você emite e que atrai ou intimida os outros</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-skyTrust mt-1 shrink-0" />
              <span>O ponto cego onde você costuma se sabotar sem se dar conta</span>
            </li>
          </ul>
        </div>

        {/* Botão de Ação Principal (Violeta-Magenta com pulso sutil) */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 rounded-2xl bg-violet-magenta hover:opacity-95 text-white font-extrabold text-base shadow-lg shadow-violet-600/30 flex items-center justify-center gap-3 transition-all duration-300 animate-pulse-subtle active:scale-98"
        >
          <span>Quero descobrir meu padrão</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Microcopy de Redução de Fricção */}
        <p className="text-xs text-slate-400 font-medium mt-3">
          Leva 2 minutos · 100% anônimo · Sem cadastro
        </p>

        {/* 3 Selos Honestos de Redução de Ansiedade */}
        <div className="grid grid-cols-3 gap-2.5 mt-8 text-center text-[11px] text-slate-300">
          <div className="p-3 rounded-xl bg-[#12142E]/70 border border-indigoBorder">
            <Clock className="w-4 h-4 mx-auto mb-1 text-skyTrust" />
            <span className="font-medium">2 Minutos</span>
          </div>
          <div className="p-3 rounded-xl bg-[#12142E]/70 border border-indigoBorder">
            <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-skyTrust" />
            <span className="font-medium">100% Confidencial</span>
          </div>
          <div className="p-3 rounded-xl bg-[#12142E]/70 border border-indigoBorder">
            <BrainCircuit className="w-4 h-4 mx-auto mb-1 text-violet-400" />
            <span className="font-medium">Sem Cadastro Prévio</span>
          </div>
        </div>
      </header>

      {/* Rodapé com link de recuperação discreto */}
      <footer className="text-center pt-8 pb-4 text-xs text-slate-500">
        <p className="mb-2">© WebLunar. Todos os direitos reservados.</p>
        <button
          onClick={onOpenRecovery}
          className="text-slate-400 hover:text-violet-300 underline transition-colors"
        >
          Já realizou o teste e perdeu sua página? Recuperar Dossiê
        </button>
      </footer>
    </div>
  );
}
