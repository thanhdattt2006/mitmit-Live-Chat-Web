import React from 'react';
import useStore from '../../store/useStore';

export default function TimerCountdownOverlay({ timeLeft }) {
  const { isConnected, isMatched } = useStore();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isConnected || isMatched) return null;

  return (
    <div className={`absolute top-6 left-1/2 -translate-x-1/2 glass-panel text-white px-5 py-1.5 rounded-full shadow-lg border ${timeLeft <= 10 ? 'border-red-500/50 text-red-500' : 'border-white/10'} flex items-center gap-2 z-10 transition-colors whitespace-nowrap`}>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
      <span className="font-mono text-base font-semibold tracking-wider shrink-0">{formatTime(timeLeft)}</span>
    </div>
  );
}
