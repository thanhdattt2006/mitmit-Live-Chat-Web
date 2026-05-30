import React, { useEffect, useState } from 'react';
import { Video as VideoIcon, Mic, MessageCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function RemoteStreamVideo({ remoteVideoRef, strangerImg }) {
  const { 
    lang, isMatching, isConnected, callMode, remoteStream, isMatched, remoteUserInfo 
  } = useStore();
  const t = translations[lang];
  const [isBlurred, setIsBlurred] = useState(true);

  const isIdle = !isMatching && !isConnected;
  const displayStrangerImg = remoteUserInfo?.avatarUrl || strangerImg || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80';
  const displayStrangerName = remoteUserInfo?.name || t.STRANGER;

  useEffect(() => {
    let blurTimeout;
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      setIsBlurred(true);
      blurTimeout = setTimeout(() => {
        setIsBlurred(false);
      }, 3000);
    }
    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, [isIdle, callMode, isMatching, remoteStream, remoteVideoRef]);

  const renderModeIcon = () => {
    if (callMode === 'video') return <VideoIcon className="w-8 h-8 text-gray-500" />;
    if (callMode === 'voice') return <Mic className="w-8 h-8 text-gray-500" />;
    return <MessageCircle className="w-8 h-8 text-gray-500" />;
  };

  if (isIdle) {
    return (
      <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center animate-fade-in p-4">
           <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-neutral-700">
             {renderModeIcon()}
           </div>
           <p className="text-gray-400 font-medium truncate">{t.READY_TO_CONNECT}</p>
           <p className="text-neutral-600 text-sm mt-1 truncate">{t.PRESS_START}</p>
        </div>
      </div>
    );
  }

  if (callMode === 'video') {
    return (
      <>
        <img 
          src={displayStrangerImg} 
          alt="Stranger" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${(isMatching || remoteStream) ? 'opacity-0' : 'opacity-100'}`} 
        />
        <video 
          ref={remoteVideoRef} 
          autoPlay 
          playsInline 
          className={`absolute inset-0 w-full h-full object-cover ${(!isMatching && remoteStream) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
          style={{ 
            filter: (isBlurred && !isMatched) ? 'blur(20px)' : 'blur(0px)',
            transition: 'filter 1.5s ease-in-out, opacity 0.5s ease'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none"></div>
      </>
    );
  }

  return (
    <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${isMatching ? 'opacity-0' : 'opacity-100'}`}>
       <video ref={remoteVideoRef} autoPlay playsInline className="hidden" />
       <div className="relative flex flex-col items-center">
         <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping scale-150"></div>
         <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping scale-[2] delay-150"></div>
         <img src={displayStrangerImg} alt="Stranger" className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-neutral-800 shadow-2xl" />
         <div className="relative z-10 mt-6 flex items-center gap-2">
           <p className="font-semibold text-lg text-white truncate">{displayStrangerName}</p>
         </div>
       </div>
    </div>
  );
}
