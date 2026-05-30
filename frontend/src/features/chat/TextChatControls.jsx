import React, { useState, useEffect } from 'react';
import { Square, ArrowRight, Heart } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function TextChatControls({ handleStopText, handleStartNextText }) {
  const { lang, callMode, isMatched, sendMatchDecision, isLoggedIn, setLoginModalOpen, remoteUserId } = useStore();
  const t = translations[lang];
  const [isLikedByMe, setIsLikedByMe] = useState(false);

  useEffect(() => {
    setIsLikedByMe(false);
  }, [remoteUserId]);

  if (callMode !== 'text') return null;

  const handleHeartClick = () => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    if (isLikedByMe || isMatched) return;
    setIsLikedByMe(true);
    sendMatchDecision();
  };

  return (
    <>
      <button 
        onClick={handleStopText} 
        className="h-9 w-9 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95"
        title={t.STOP_BUTTON}
      >
        <Square className="w-3 h-3 fill-current" />
      </button>

      {!isMatched && (
        <button 
          onClick={handleHeartClick}
          disabled={isLikedByMe}
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            isLikedByMe 
              ? 'bg-rose-500 text-white cursor-not-allowed' 
              : 'bg-neutral-800 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10'
          }`}
          title="Match"
        >
          <Heart className={`w-4 h-4 ${isLikedByMe ? 'fill-current' : ''}`} />
        </button>
      )}

      <button 
        onClick={handleStartNextText} 
        className="h-9 px-4 rounded-full bg-white text-neutral-900 hover:bg-gray-200 font-semibold flex items-center gap-2 transition-all active:scale-95 text-sm"
      >
        <span>{t.NEXT_BUTTON}</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </button>
    </>
  );
}
