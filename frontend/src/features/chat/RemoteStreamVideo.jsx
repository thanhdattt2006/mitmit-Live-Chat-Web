import React, { useEffect, useState, forwardRef } from 'react';
import { Video as VideoIcon, Mic, MessageCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

const RemoteStreamVideo = forwardRef(({ strangerImg }, ref) => {
  const { 
    lang, isMatching, isConnected, callMode, remoteStream, isMatched, remoteUserInfo 
  } = useStore();
  const t = translations[lang];
  const [isBlurred, setIsBlurred] = useState(true);
  const [volume, setVolume] = useState(0);

  const isIdle = !isMatching && !isConnected;
  const displayStrangerImg = remoteUserInfo?.avatarUrl || strangerImg || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80';
  const displayStrangerName = remoteUserInfo?.name || t.STRANGER;

  useEffect(() => {
    let blurTimeout;
    if (ref && ref.current && remoteStream) {
      ref.current.srcObject = remoteStream;
      setIsBlurred(true);
      blurTimeout = setTimeout(() => {
        setIsBlurred(false);
      }, 3000);
    }
    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };
  }, [isIdle, callMode, isMatching, remoteStream, ref]);

  useEffect(() => {
    let audioContext;
    let analyzer;
    let source;
    let animationFrame;

    if (remoteStream && remoteStream.getAudioTracks().length > 0 && callMode === 'voice' && !isIdle) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.warn("Cannot resume audio context:", e));
        }

        analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        
        source = audioContext.createMediaStreamSource(new MediaStream([remoteStream.getAudioTracks()[0]]));
        source.connect(analyzer);
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        const updateVolume = () => {
          analyzer.getByteFrequencyData(dataArray);
          let sum = 0;
          for(let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolume(avg);
          animationFrame = requestAnimationFrame(updateVolume);
        };
        
        updateVolume();
      } catch (err) {
        console.error("Audio API Error:", err);
      }
    }
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (source) source.disconnect();
      if (analyzer) analyzer.disconnect();
      if (audioContext && audioContext.state !== 'closed') audioContext.close();
    };
  }, [remoteStream, callMode, isIdle]);

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
          ref={ref} 
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
       <video ref={ref} autoPlay playsInline className="hidden" />
       <div className="relative flex flex-col items-center">
         <div className="absolute inset-0 bg-blue-500/20 rounded-full transition-transform duration-75 ease-out" style={{ transform: `scale(${1 + volume / 100})`, opacity: volume > 5 ? 0.8 : 0 }}></div>
         <div className="absolute inset-0 bg-blue-500/10 rounded-full transition-transform duration-150 ease-out" style={{ transform: `scale(${1 + volume / 50})`, opacity: volume > 5 ? 0.5 : 0 }}></div>
         <img src={displayStrangerImg} alt="Stranger" className="relative z-10 w-32 h-32 rounded-full object-cover border-4 border-neutral-800 shadow-2xl" />
         <div className="relative z-10 mt-6 flex items-center gap-2">
           <p className="font-semibold text-lg text-white truncate">{displayStrangerName}</p>
         </div>
       </div>
    </div>
  );
});

export default RemoteStreamVideo;
