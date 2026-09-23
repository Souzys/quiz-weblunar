import React, { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen.jsx';
import QuizFlowScreen from './screens/QuizFlowScreen.jsx';
import LoadingScreen from './screens/LoadingScreen.jsx';
import PaywallScreen from './screens/PaywallScreen.jsx';
import DossierScreen from './screens/DossierScreen.jsx';
import PixModal from './components/PixModal.jsx';
import RecoveryModal from './components/RecoveryModal.jsx';
import { api } from './services/api.js';
import { listenPaymentStatus } from './services/sseClient.js';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [sessionId, setSessionId] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [archetype, setArchetype] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isPixExpired, setIsPixExpired] = useState(false);
  const [dossierData, setDossierData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // 1. Checa se o usuário acessou diretamente um link de resultado (/resultado/:sessionId)
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (path.startsWith('/resultado/')) {
      const directSessionId = path.split('/resultado/')[1];
      if (directSessionId) {
        loadDossier(directSessionId, token);
      }
    }
  }, []);

  // 2. Escuta Server-Sent Events (SSE) quando há um Pix ativo
  useEffect(() => {
    let sseListener = null;

    if (sessionId && currentScreen === 'paywall') {
      sseListener = listenPaymentStatus({
        sessionId,
        onApproved: (token) => {
          setIsPixModalOpen(false);
          loadDossier(sessionId, token);
        },
        onError: (err) => console.warn('[SSE_CLIENT]', err)
      });
    }

    return () => {
      if (sseListener) sseListener.cleanup();
    };
  }, [sessionId, currentScreen]);

  // Carrega o dossiê completo após confirmação de pagamento
  const loadDossier = async (id, token) => {
    try {
      const data = await api.getDossier(id, token);
      setDossierData(data);
      setCurrentScreen('dossier');
      if (!window.location.pathname.includes('/resultado/')) {
        window.history.pushState({}, '', `/resultado/${id}${token ? `?token=${token}` : ''}`);
      }
    } catch (err) {
      console.error('[LOAD_DOSSIER]', err);
      setErrorMsg(err.message || 'Falha ao carregar seu dossiê.');
    }
  };

  // Início do Quiz
  const handleStart = () => {
    setCurrentScreen('quiz');
  };

  // Envio das respostas do Quiz
  const handleQuizComplete = async ({ firstName: name, answers }) => {
    setFirstName(name);
    setCurrentScreen('loading');

    try {
      const res = await api.startQuiz(name, answers);
      setSessionId(res.sessionId);
      setArchetype(res.archetype);
    } catch (err) {
      alert(err.message || 'Erro ao processar questionário.');
      setCurrentScreen('quiz');
    }
  };

  // Fake loading finalizado -> vai para o Paywall
  const handleLoadingDone = () => {
    setCurrentScreen('paywall');
  };

  // Abertura do Modal do Pix (pede o e-mail na finalização)
  const handleUnlockClick = () => {
    setIsPixModalOpen(true);
  };

  // Simulação de aprovação em dev
  const handleSimulateSuccess = (token) => {
    setIsPixModalOpen(false);
    loadDossier(sessionId, token);
  };

  return (
    <div className="min-h-screen bg-[#0D0E1F] text-slate-100 flex flex-col font-sans">
      {errorMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto p-4 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-200 text-xs text-center shadow-2xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-2 font-bold">×</button>
        </div>
      )}

      {currentScreen === 'landing' && (
        <LandingScreen
          onStart={handleStart}
        />
      )}

      {currentScreen === 'quiz' && (
        <QuizFlowScreen
          onComplete={handleQuizComplete}
          onBackToLanding={() => setCurrentScreen('landing')}
        />
      )}

      {currentScreen === 'loading' && (
        <LoadingScreen onDone={handleLoadingDone} />
      )}

      {currentScreen === 'paywall' && (
        <PaywallScreen
          sessionId={sessionId}
          firstName={firstName}
          archetype={archetype}
          onUnlockClick={handleUnlockClick}
        />
      )}

      {currentScreen === 'dossier' && (
        <DossierScreen dossierData={dossierData} />
      )}

      {/* Modal do Pix (com etapa de e-mail de segurança) */}
      <PixModal
        isOpen={isPixModalOpen}
        onClose={() => setIsPixModalOpen(false)}
        sessionId={sessionId}
        pixData={pixData}
        isExpired={isPixExpired}
        onPixGenerated={(newPix) => setPixData(newPix)}
        onPixUpdated={(newPix) => {
          setPixData(newPix);
          setIsPixExpired(false);
        }}
        onSimulateSuccess={handleSimulateSuccess}
      />

      {/* Modal de Recuperação de Dossiê */}
      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onSelectSession={(recId) => {
          setIsRecoveryModalOpen(false);
          loadDossier(recId);
        }}
      />

      {/* Vercel Analytics para monitoramento de visitas em tempo real */}
      <Analytics />
    </div>
  );
}
