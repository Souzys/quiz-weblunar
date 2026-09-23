import React from 'react';

export default function ProgressBar({ current, total }) {
  // Efeito psicológico de progresso: começa em 15% logo na primeira pergunta
  const percentage = Math.min(100, Math.round(15 + ((current) / total) * 85));

  return (
    <div className="w-full max-w-xl mx-auto mb-6 px-4">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
        <span className="uppercase tracking-wider">Progresso da Análise</span>
        <span className="text-violet-400 font-bold">{percentage}%</span>
      </div>
      <div className="w-full h-2.5 bg-[#12142E] rounded-full overflow-hidden border border-indigoBorder p-0.5">
        <div
          className="h-full bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#22C55E] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
