import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizQuestions.js';
import ProgressBar from '../components/ProgressBar.jsx';
import { ArrowRight, ArrowLeft, User, Sparkles, CheckCircle2 } from 'lucide-react';

const MICRO_FEEDBACKS = {
  1: 'Interessante. Essa resposta muda a leitura do restante do seu perfil.',
  3: 'Anotado. A matriz indica uma separação nítida entre o que você sente e o que os outros enxergam.',
  5: 'Calibrando: você está delineando os traços de um arquétipo de alta complexidade psicológica.'
};

export default function QuizFlowScreen({ onComplete, onBackToLanding }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [firstName, setFirstName] = useState('');
  const [isNameStep, setIsNameStep] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [microFeedback, setMicroFeedback] = useState(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 para a etapa do nome

  // Resposta previamente escolhida nesta pergunta (se o usuário voltou)
  const previouslySelected = !isNameStep ? answers[currentQuestion.id] : null;

  const handleSelectOption = (option) => {
    setSelectedOption(option.archetype);

    setTimeout(() => {
      const nextAnswers = { ...answers, [currentQuestion.id]: option.archetype };
      setAnswers(nextAnswers);
      setSelectedOption(null);

      // Checa se há micro-feedback para esta etapa
      if (MICRO_FEEDBACKS[currentIndex]) {
        setMicroFeedback(MICRO_FEEDBACKS[currentIndex]);
        setTimeout(() => {
          setMicroFeedback(null);
          advanceNext(nextAnswers);
        }, 1500);
      } else {
        advanceNext(nextAnswers);
      }
    }, 250);
  };

  const advanceNext = (nextAnswers) => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsNameStep(true);
    }
  };

  const handleBack = () => {
    if (isNameStep) {
      setIsNameStep(false);
      setCurrentIndex(QUIZ_QUESTIONS.length - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (onBackToLanding) {
      onBackToLanding();
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) return;
    onComplete({ firstName: firstName.trim(), answers });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6 max-w-xl mx-auto bg-indigo-gradient text-slate-100">
      
      {/* Topo: Botão Voltar + Barra de Progresso */}
      <header className="pt-2 space-y-2">
        <div className="flex items-center justify-between px-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 px-2 rounded-lg hover:bg-[#12142E]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
          
          <span className="text-[11px] font-mono text-slate-400">
            {isNameStep ? 'Etapa Final' : `${currentIndex + 1} de ${QUIZ_QUESTIONS.length}`}
          </span>
        </div>

        <ProgressBar
          current={isNameStep ? QUIZ_QUESTIONS.length + 1 : currentIndex + 1}
          total={totalSteps}
        />
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col justify-center my-6">
        {microFeedback ? (
          /* Micro-Feedback de Compromisso (Zeigarnik) */
          <div className="p-6 rounded-2xl bg-[#12142E] border border-violet-500/40 text-center space-y-3 animate-fade-in shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-200 leading-relaxed max-w-md mx-auto">
              {microFeedback}
            </p>
            <span className="text-[11px] font-mono text-skyTrust flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Calibrando próximo vetor...
            </span>
          </div>
        ) : !isNameStep ? (
          <div className="space-y-6">
            {/* Cabeçalho da Pergunta */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                Pergunta {currentIndex + 1} de {QUIZ_QUESTIONS.length}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </h2>
              {currentQuestion.subtitle && (
                <p className="text-xs sm:text-sm text-slate-400">
                  {currentQuestion.subtitle}
                </p>
              )}
            </div>

            {/* Lista de Opções */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option.archetype || (!selectedOption && previouslySelected === option.archetype);
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-4 rounded-xl text-left border transition-all duration-200 relative overflow-hidden group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-violet-600/30 border-violet-400 text-white shadow-lg shadow-violet-500/20'
                        : 'bg-[#12142E]/80 hover:bg-[#181a3d] border-indigoBorder text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-violet-400 bg-violet-500 text-white'
                            : 'border-slate-700 bg-slate-900/60 text-slate-400 group-hover:border-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium leading-relaxed block">
                          {option.label}
                        </span>
                        {option.badge && (
                          <span className="inline-block mt-2 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/80 text-slate-300">
                            {option.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Etapa de Coleta do Primeiro Nome */
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/25 text-violet-400 mx-auto">
              <User className="w-7 h-7" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="text-xs font-bold text-skyTrust uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Quase Pronto!
              </span>
              <h2 className="text-2xl font-bold text-white">
                Como você gostaria de ser chamado(a) no seu relatório?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Usaremos apenas o seu primeiro nome para personalizar a leitura confidencial do seu perfil.
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="max-w-md mx-auto space-y-4 pt-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Digite seu primeiro nome (ex: Lucas)"
                maxLength={30}
                required
                autoFocus
                className="w-full px-5 py-4 bg-[#12142E] border border-indigoBorder focus:border-violet-500 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-center font-semibold"
              />

              <button
                type="submit"
                disabled={!firstName.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-violet-magenta hover:opacity-95 text-white font-extrabold text-base shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 active:scale-98"
              >
                <span>Processar Meu Diagnóstico</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer Informativo */}
      <footer className="text-center text-xs text-slate-400 pb-2">
        <span>Respostas estritamente confidenciais e anônimas</span>
      </footer>
    </div>
  );
}
