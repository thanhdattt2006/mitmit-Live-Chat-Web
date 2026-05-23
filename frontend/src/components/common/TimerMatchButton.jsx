import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export default function TimerMatchButton({ 
  initialTime = 180, 
  onTimeUp,
  onMatch
}) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isMatched, setIsMatched] = useState(false);

  useEffect(() => {
    if (isMatched) return;

    if (timeLeft <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isMatched, onTimeUp]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleMatch = () => {
    if (isMatched) return;
    setIsMatched(true);
    if (onMatch) onMatch();
  };

  const isWarning = timeLeft <= 10 && !isMatched;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 animate-fade-in">
      {/* Timer */}
      <div className={`glass-panel px-4 py-1.5 rounded-full shadow-lg border flex items-center gap-2 transition-colors ${
        isWarning 
          ? 'border-rose-500/50 text-rose-500 bg-rose-500/10' 
          : 'border-white/10 text-white bg-black/40 backdrop-blur-md'
      }`}>
        {!isMatched && (
          <div className={`w-2 h-2 rounded-full shrink-0 ${isWarning ? 'bg-rose-500 animate-ping' : 'bg-rose-500 animate-pulse'}`}></div>
        )}
        <span className="font-mono text-base font-semibold tracking-wider shrink-0">
          {isMatched ? 'MATCHED' : formatTime(timeLeft)}
        </span>
      </div>

      {/* Match Button */}
      <button
        onClick={handleMatch}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg shrink-0 border ${
          isMatched
            ? 'bg-pink-500/20 border-pink-500/50'
            : 'bg-black/40 border-white/10 hover:bg-pink-500/10 hover:border-pink-500/30 backdrop-blur-md'
        }`}
        title="Like / Match"
      >
        <Heart 
          className={`w-5 h-5 transition-all ${
            isMatched 
              ? 'fill-pink-500 text-pink-500 scale-110' 
              : 'text-white'
          }`} 
        />
      </button>
    </div>
  );
}
