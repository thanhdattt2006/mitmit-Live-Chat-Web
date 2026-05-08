import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Heart, ArrowRight, Loader2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

const STRANGER_IMAGES = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80"
];

export default function VideoBox() {
  const { lang, isMatching, startMatching, setConnected, addMessage, clearMessages, callMode } = useStore();
  const t = translations[lang];

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [strangerImg, setStrangerImg] = useState(STRANGER_IMAGES[0]);
  
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    if (isMatching) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isMatching]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNext = () => {
    startMatching();
    clearMessages();
    setIsFriend(false);
    
    setTimeout(() => {
      setStrangerImg(STRANGER_IMAGES[Math.floor(Math.random() * STRANGER_IMAGES.length)]);
      setConnected(true);
      setTimeLeft(180);
      addMessage({ id: Date.now().toString(), type: 'system', text: t.SYSTEM_MSG_HELLO });
    }, 1500);
  };

  useEffect(() => {
    if (!isMatching) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force cam off in voice mode
  useEffect(() => {
    if (callMode === 'voice') {
      setIsCamOn(false);
    }
  }, [callMode]);

  return (
    <section className="flex-1 relative rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 shadow-sm flex items-center justify-center h-full">
      
      {/* Main Screen */}
      {callMode === 'video' ? (
        <>
          <img 
            src={strangerImg} 
            alt="Stranger" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isMatching ? 'opacity-0' : 'opacity-100'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
        </>
      ) : (
        <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-[#0a0a0a] transition-opacity duration-500 ${isMatching ? 'opacity-0' : 'opacity-100'}`}>
           <div className="relative flex flex-col items-center">
             {/* Sound waves CSS pulse */}
             <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
             <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-[2] delay-150"></div>
             
             <img src={strangerImg} alt="Stranger" className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-2xl" />
             <p className="relative z-10 mt-6 font-semibold text-lg">{t.STRANGER} #8429</p>
           </div>
        </div>
      )}

      {/* Loading Overlay */}
      <div className={`absolute inset-0 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 text-white z-20 ${isMatching ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="animate-spin w-10 h-10 mb-3 text-white" />
        <p className="font-medium tracking-wide animate-pulse">{t.FINDING_SOMEONE}</p>
      </div>

      {/* Your Camera PiP (only visible in video mode) */}
      {callMode === 'video' && (
        <div className="absolute bottom-6 right-6 w-32 h-44 sm:w-40 sm:h-56 bg-neutral-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 group cursor-pointer hover:scale-105 transition-transform duration-300">
          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80" alt="You" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">{t.YOU}</div>
        </div>
      )}

      {/* Timer Overlay */}
      {!isMatching && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 glass-panel text-neutral-900 dark:text-white px-5 py-1.5 rounded-full shadow-lg border ${timeLeft <= 10 ? 'border-red-500/50 text-red-500' : 'border-white/20 dark:border-white/10'} flex items-center gap-2 z-10 transition-colors`}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-mono text-base font-semibold tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel p-2 rounded-full border border-white/20 dark:border-white/10 shadow-2xl flex items-center gap-2 z-10">
        <button 
          onClick={() => setIsMicOn(!isMicOn)} 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 ${isMicOn ? 'bg-white/20 dark:bg-black/40 hover:bg-white/40 dark:hover:bg-black/60' : 'bg-red-500/80'}`}
        >
          {isMicOn ? <Mic className="w-5 h-5 fill-current" /> : <MicOff className="w-5 h-5 fill-current" />}
        </button>

        <button 
          onClick={() => setIsCamOn(!isCamOn)}
          disabled={callMode === 'voice'} 
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${isCamOn && callMode === 'video' ? 'bg-white/20 dark:bg-black/40 hover:bg-white/40 dark:hover:bg-black/60' : 'bg-red-500/80'}`}
        >
          {isCamOn && callMode === 'video' ? <VideoIcon className="w-5 h-5 fill-current" /> : <VideoOff className="w-5 h-5 fill-current" />}
        </button>

        <div className="w-px h-8 bg-white/20 mx-1"></div>

        <button 
          onClick={() => setIsFriend(!isFriend)} 
          className="w-12 h-12 rounded-full bg-white/20 dark:bg-black/40 hover:bg-pink-500/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 group"
        >
          <Heart className={`w-6 h-6 transition-colors ${isFriend ? 'fill-pink-500 text-pink-500' : 'group-hover:text-pink-400'}`} />
        </button>

        <button 
          onClick={handleNext} 
          disabled={isMatching}
          className="h-12 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-100 flex items-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50"
        >
          <span>{t.NEXT_BUTTON}</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </section>
  );
}
