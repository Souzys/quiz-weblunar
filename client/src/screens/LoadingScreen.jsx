import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Cruzando padrões de micro-comportamento...',
  'Mapeando matriz de percepção e projeção social...',
  'Identificando arquétipo dominante e traço oculto...',
  'Calculando índice de magnetismo vs. intimidação...',
  'Dossiê confidencial compilado com sucesso!'
];

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Incremento de porcentagem de 0 a 100%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 500);
          return 100;
        }
        // Avanço rápido e depois mais suave
        const jump = prev < 70 ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 4) + 2;
        return Math.min(100, prev + jump);
      });
    }, 140);

    return () => clearInterval(interval);
  }, [onDone]);

  useEffect(() => {
    // Altera mensagens com base no progresso
    const index = Math.min(
      ANALYSIS_STEPS.length - 1,
      Math.floor((progress / 100) * ANALYSIS_STEPS.length)
    );
    setStepIndex(index);
  }, [progress]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 max-w-md mx-auto text-center">
      {/* Radar Tecnológico em Anéis */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border border-purple-500/30 animate-spin-slow" />
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-indigo-400/40 animate-spin" />
        
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-900 to-slate-900 border border-indigo-500/50 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/20">
          <Cpu className="w-6 h-6 text-indigo-400 mb-1" />
          <span className="font-mono text-xs font-bold text-white">{progress}%</span>
        </div>
      </div>

      {/* Título de Processamento */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        Analisando Suas Respostas
      </h3>

      {/* Mensagem Rotativa de Alto Valor Percebido */}
      <p className="text-sm text-indigo-300 font-medium h-12 flex items-center justify-center px-4 transition-all duration-300">
        {ANALYSIS_STEPS[stepIndex]}
      </p>

      {/* Barra de Progresso Delicada */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-8">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Algoritmo de calibragem Big Five & Projeção Inconsciente</span>
      </div>
    </div>
  );
}
