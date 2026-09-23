import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { api } from '../services/api.js';

export default function ServerTimer({ sessionId, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 min padrão enquanto sincroniza
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval = null;

    async function syncTimer() {
      try {
        const res = await api.getTimeLeft(sessionId);
        setSecondsLeft(res.secondsLeft);
        setLoading(false);

        if (res.secondsLeft <= 0 && onExpire) {
          onExpire();
        }
      } catch (err) {
        console.warn('[TIMER] Erro ao sincronizar com servidor, usando tempo estimado local:', err);
        setLoading(false);
      }
    }

    if (sessionId) {
      syncTimer();

      // Countdown a cada 1 segundo
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            if (onExpire) onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = secondsLeft < 180; // Menos de 3 minutos

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        isUrgent
          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
          : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-400' : 'text-amber-400'}`} />
      <span className="text-xs font-semibold uppercase tracking-wider">
        Condição especial encerra em:
      </span>
      <span className="font-mono font-bold text-sm tracking-widest">
        {loading ? '--:--' : formattedTime}
      </span>
    </div>
  );
}
