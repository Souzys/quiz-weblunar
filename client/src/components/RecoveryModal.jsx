import React, { useState } from 'react';
import { Search, Mail, ExternalLink, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api.js';

export default function RecoveryModal({ isOpen, onClose, onSelectSession }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await api.recoverDossier(email);
      setResults(res.sessions);
    } catch (err) {
      setError(err.message || 'Nenhum dossiê aprovado encontrado para este e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111726] border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Recuperar Meu Dossiê</h3>
          <p className="text-xs text-slate-400 mt-1">
            Já realizou o teste e pagou o Pix? Digite seu e-mail para abrir seu resultado.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 mb-4">
          <input
            type="email"
            placeholder="Digite o e-mail informado no pagamento"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Buscando...' : 'Localizar Meu Dossiê'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Dossiês Encontrados:
            </p>
            {results.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between text-left transition-all"
              >
                <div>
                  <div className="text-sm font-semibold text-white">
                    Dossiê de {session.firstName}
                  </div>
                  <div className="text-xs text-slate-400">
                    Aprovado em {new Date(session.paidAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-indigo-400" />
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
