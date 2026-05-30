import React, { useEffect } from 'react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function LocalStreamPreview({ localVideoRef }) {
  const { lang, callMode, isMatching, isConnected, localStream } = useStore();
  const t = translations[lang];
  const isIdle = !isMatching && !isConnected;

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [isIdle, callMode, isMatching, localStream, localVideoRef]);

  if (callMode !== 'video' || isIdle || !localStream) return null;

  return (
    <div className="absolute bottom-6 right-6 w-32 h-48 sm:w-40 sm:h-56 bg-neutral-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 group cursor-pointer hover:scale-105 transition-transform duration-300">
      <video 
        ref={localVideoRef}
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover transform scale-x-[-1]" 
      />
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium truncate max-w-[80%]">{t.YOU}</div>
    </div>
  );
}
