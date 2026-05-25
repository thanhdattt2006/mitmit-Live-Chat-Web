import React from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, AlertTriangle, Heart, Square, Play, ArrowRight } from 'lucide-react';
import { translations } from '../../utils/translation';

export default function VideoChatControls({
  isIdle,
  isMatching,
  callMode,
  isMicOn,
  isCamOn,
  setIsMicOn,
  setIsCamOn,
  handleGuestAction,
  setShowReportModal,
  handleHeartClick,
  isLikedByMe,
  isMatched,
  handleStop,
  handleStartNext,
  lang
}) {
  const t = translations[lang];

  return (
    <div className="fixed bottom-4 sm:absolute sm:bottom-6 left-1/2 -translate-x-1/2 glass-panel p-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-2 z-10 max-w-[95%] overflow-x-auto no-scrollbar">
        {!isIdle && (
          <>
            <button 
              onClick={() => setIsMicOn(!isMicOn)} 
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 shrink-0 ${isMicOn ? 'bg-black/40 hover:bg-black/60' : 'bg-red-500/80'}`}
            >
              {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />}
            </button>

            <button 
              onClick={() => setIsCamOn(!isCamOn)}
              disabled={callMode !== 'video'} 
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${isCamOn && callMode === 'video' ? 'bg-black/40 hover:bg-black/60' : 'bg-red-500/80'}`}
            >
              {isCamOn && callMode === 'video' ? <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />}
            </button>

            <div className="w-px h-8 bg-white/20 mx-1 shrink-0"></div>

            <button 
              onClick={() => handleGuestAction(() => setShowReportModal(true))} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-rose-500/20 text-gray-300 hover:text-rose-500 flex items-center justify-center backdrop-blur-md transition-all active:scale-95 group shrink-0"
              title={t.REPORT_USER}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 transition-all shrink-0" />
            </button>

            <button 
              onClick={handleHeartClick} 
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-pink-500/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-75 group shrink-0"
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all shrink-0 ${(isLikedByMe || isMatched) ? 'fill-pink-500 text-pink-500 scale-110' : 'group-hover:text-pink-400'}`} />
            </button>

            <button 
              onClick={handleStop} 
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg mx-1 shrink-0"
              title={t.STOP_BUTTON}
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4 fill-current shrink-0" />
            </button>
          </>
        )}

        <button 
          onClick={handleStartNext} 
          disabled={isMatching}
          className={`h-10 sm:h-12 px-4 sm:px-6 rounded-full font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50 shrink-0 whitespace-nowrap min-w-fit justify-center ${isIdle ? 'bg-white text-neutral-900 hover:bg-gray-200 text-base sm:text-lg px-8 sm:px-10' : 'bg-white text-neutral-900 hover:bg-gray-200'}`}
        >
          {isIdle ? (
            <>
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
              <span>{t.START_BUTTON}</span>
            </>
          ) : (
            <>
              <span>{t.NEXT_BUTTON}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3] shrink-0" />
            </>
          )}
        </button>
      </div>
  );
}
