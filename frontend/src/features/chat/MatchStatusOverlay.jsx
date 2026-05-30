import React from 'react';
import { Loader2, MessageCircle, Play } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function MatchStatusOverlay({ handleStartNextText }) {
  const { lang, isMatching, callMode } = useStore();
  const t = translations[lang];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-center p-6 relative">
      {isMatching ? (
        <div className="flex flex-col items-center animate-fade-in">
          <Loader2 className="animate-spin w-12 h-12 mb-4 text-white shrink-0" />
          <p className="font-medium tracking-wide animate-pulse text-lg">{t.FINDING_SOMEONE}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
          <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-neutral-700 shrink-0">
            <MessageCircle className="w-12 h-12 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t.READY_TO_CONNECT}</h2>
          <p className="text-gray-400 text-sm mb-8 px-4">{t.PRESS_START}</p>
          
          {callMode === 'text' && (
            <button 
              onClick={handleStartNextText} 
              className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-white text-neutral-900 hover:bg-gray-200 text-lg shrink-0"
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>{t.START_BUTTON}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
