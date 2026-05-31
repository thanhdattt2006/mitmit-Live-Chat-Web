import React, { useEffect, forwardRef } from 'react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

const LocalStreamPreview = forwardRef((props, ref) => {
  const { lang, callMode, isMatching, isConnected, localStream } = useStore();
  const t = translations[lang];
  const isIdle = !isMatching && !isConnected;

  useEffect(() => {
    if (ref && ref.current && localStream) {
      ref.current.srcObject = localStream;
    }
  }, [isIdle, callMode, isMatching, localStream, ref]);

  if (callMode !== 'video' || isIdle || !localStream) return null;

  return (
    <div className="absolute bottom-20 sm:bottom-6 right-4 sm:right-6 w-24 h-36 sm:w-40 sm:h-56 bg-neutral-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 group cursor-pointer hover:scale-105 transition-transform duration-300">
      <video 
        ref={ref}
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover transform scale-x-[-1]" 
      />
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium truncate max-w-[80%]">{t.YOU}</div>
    </div>
  );
});

export default LocalStreamPreview;
