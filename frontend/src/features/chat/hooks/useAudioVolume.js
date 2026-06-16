import { useEffect, useState } from 'react';

export function useAudioVolume(remoteStream, callMode, isIdle) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let audioContext;
    let analyzer;
    let source;
    let animationFrame;

    if (remoteStream && remoteStream.getAudioTracks().length > 0 && callMode === 'voice' && !isIdle) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.error("Cannot resume audio context:", e));
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

  return volume;
}
