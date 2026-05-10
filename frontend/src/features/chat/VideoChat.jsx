import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Heart, ArrowRight, Loader2, Play, Square, MessageCircle, AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import ReportModal from '../../components/common/ReportModal';

const STRANGER_IMAGES = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=80"
];

export default function VideoChat() {
  const { lang, isMatching, isConnected, startMatching, setConnected, stopCall, addMessage, clearMessages, callMode, addFriend } = useStore();
  const t = translations[lang];

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  
  const [strangerImg, setStrangerImg] = useState(STRANGER_IMAGES[0]);
  const [timeLeft, setTimeLeft] = useState(180);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Match state
  const [isLikedByMe, setIsLikedByMe] = useState(false);
  const [isLikedByStranger, setIsLikedByStranger] = useState(false);
  const [showPremiumMatch, setShowPremiumMatch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isMatch = isLikedByMe && isLikedByStranger;
  const isIdle = !isMatching && !isConnected;

  useEffect(() => {
    if (!isConnected || isMatch) return;
    
    if (timeLeft <= 0) {
      handleStartNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isConnected, isMatch, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleStartNext = async () => {
    try {
      if (!localStreamRef.current && callMode !== 'text') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: callMode === 'video', 
            audio: true 
          });
          localStreamRef.current = stream;
        } catch (err) {
          console.error("Camera/Mic access denied or error:", err);
        }
      }

      startMatching();
      clearMessages();
      setIsLikedByMe(false);
      setIsLikedByStranger(false);
      setShowPremiumMatch(false);
      
      setTimeout(() => {
        setStrangerImg(STRANGER_IMAGES[Math.floor(Math.random() * STRANGER_IMAGES.length)]);
        setConnected(true);
        setTimeLeft(180);
        addMessage({ id: Date.now().toString(), type: 'system', text: t.SYSTEM_MSG_HELLO });
      }, 1500);
    } catch (error) {
      console.error('Error starting next match:', error);
    }
  };

  const handleStop = () => {
    try {
      stopCall();
      clearMessages();
      setIsLikedByMe(false);
      setIsLikedByStranger(false);
      setShowPremiumMatch(false);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  };

  useEffect(() => {
    if (callMode === 'voice') {
      setIsCamOn(false);
    }
  }, [callMode]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isIdle, callMode, isMatching]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isCamOn;
      });
    }
  }, [isCamOn]);

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleHeartClick = () => {
    try {
      if (isLikedByMe) return; // Prevent multiple triggers
      
      setIsLikedByMe(true);
      
      // Mock stranger like
      setTimeout(() => {
        setIsLikedByStranger(true);
        setShowPremiumMatch(true);

        addFriend({
          id: Date.now(),
          name: `${t.STRANGER} #8429`,
          avatar: strangerImg,
          lastMsg: t.ITS_A_MATCH
        });
        
        setTimeout(() => setShowPremiumMatch(false), 1500);
      }, 2000);
    } catch (error) {
      console.error('Error processing heart click:', error);
    }
  };

  const renderModeIcon = () => {
    if (callMode === 'video') return <VideoIcon className="w-8 h-8 text-gray-500" />;
    if (callMode === 'voice') return <Mic className="w-8 h-8 text-gray-500" />;
    return <MessageCircle className="w-8 h-8 text-gray-500" />;
  };

  return (
    <section className="flex-1 relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm flex items-center justify-center h-full min-w-0">
      
      {/* Main Screen */}
      {isIdle ? (
        <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
          <div className="text-center animate-fade-in p-4">
             <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-neutral-700">
               {renderModeIcon()}
             </div>
             <p className="text-gray-400 font-medium truncate">{t.READY_TO_CONNECT}</p>
             <p className="text-neutral-600 text-sm mt-1 truncate">{t.PRESS_START}</p>
          </div>
        </div>
      ) : callMode === 'video' ? (
        <>
          <img 
            src={strangerImg} 
            alt="Stranger" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isMatching ? 'opacity-0' : 'opacity-100'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
        </>
      ) : (
        <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${isMatching ? 'opacity-0' : 'opacity-100'}`}>
           <div className="relative flex flex-col items-center">
             <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
             <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-[2] delay-150"></div>
             
             <img src={strangerImg} alt="Stranger" className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-neutral-800 shadow-2xl" />
             <p className="relative z-10 mt-6 font-semibold text-lg text-white truncate">{t.STRANGER} #8429</p>
           </div>
        </div>
      )}

      {/* Loading Overlay */}
      <div className={`absolute inset-0 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 text-white z-20 p-4 ${isMatching ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="animate-spin w-10 h-10 mb-3 text-white shrink-0" />
        <p className="font-medium tracking-wide animate-pulse text-center">{t.FINDING_SOMEONE}</p>
      </div>

      {/* Premium Match Overlay */}
      {showPremiumMatch && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in transition-opacity duration-500 pointer-events-none">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] tracking-widest mb-6 transition-all duration-700 ease-out translate-y-0 opacity-100">
            MATCHED!
          </h1>
          <div className="flex items-center">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" alt="You" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xl relative z-10 translate-x-3 transition-transform duration-1000" />
            <img src={strangerImg} alt="Stranger" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xl relative z-0 -translate-x-3 transition-transform duration-1000" />
          </div>
        </div>
      )}

      {/* Your Camera PiP */}
      {callMode === 'video' && !isIdle && (
        <div className="absolute bottom-6 right-6 w-24 h-36 sm:w-32 sm:h-44 bg-neutral-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 group cursor-pointer hover:scale-105 transition-transform duration-300">
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover transform scale-x-[-1]" 
          />
          <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium truncate max-w-[80%]">{t.YOU}</div>
        </div>
      )}

      {/* Timer Overlay */}
      {isConnected && !isMatch && (
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 glass-panel text-white px-5 py-1.5 rounded-full shadow-lg border ${timeLeft <= 10 ? 'border-red-500/50 text-red-500' : 'border-white/10'} flex items-center gap-2 z-10 transition-colors whitespace-nowrap`}>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></div>
          <span className="font-mono text-base font-semibold tracking-wider shrink-0">{formatTime(timeLeft)}</span>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-panel p-2 rounded-full border border-white/10 shadow-2xl flex items-center gap-2 z-10 max-w-[95%] overflow-x-auto no-scrollbar">
        
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
              onClick={() => setShowReportModal(true)} 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-rose-500/20 text-gray-300 hover:text-rose-500 flex items-center justify-center backdrop-blur-md transition-all active:scale-95 group shrink-0"
              title={t.REPORT_USER}
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 transition-all shrink-0" />
            </button>

            <button 
              onClick={handleHeartClick} 
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-pink-500/20 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-75 group shrink-0"
            >
              <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-all shrink-0 ${isLikedByMe ? 'fill-pink-500 text-pink-500 scale-110' : 'group-hover:text-pink-400'}`} />
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

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onReportSuccess={handleStartNext} 
      />
    </section>
  );
}
