import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VoicePlayer({ audioUrl, isMine }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Generate random heights for waveform bars once
  const [waveHeights] = useState(() => 
    [...Array(24)].map(() => 20 + Math.random() * 80)
  );

  useEffect(() => {
    if (!audioUrl) return;
    
    // Initialize audio
    audioRef.current = new Audio(audioUrl);
    
    const setAudioData = () => {
      setDuration(audioRef.current.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };

    audioRef.current.addEventListener('loadedmetadata', setAudioData);
    audioRef.current.addEventListener('timeupdate', setAudioTime);
    audioRef.current.addEventListener('ended', handleAudioEnd);

    // Some browsers need this to trigger loadedmetadata on blob URLs
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', setAudioData);
        audioRef.current.removeEventListener('timeupdate', setAudioTime);
        audioRef.current.removeEventListener('ended', handleAudioEnd);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Error playing audio:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 w-64 shadow-inner ${isMine ? 'text-white' : 'text-gray-100'}`}>
      <button 
        onClick={togglePlay}
        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${isMine ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-gray-200'} active:scale-95`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 relative h-8 flex items-center mx-1">
        {/* Waveform Bars */}
        <div className="absolute inset-0 flex items-center justify-between gap-[2px] pointer-events-none">
          {waveHeights.map((h, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying 
                  ? (isMine ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]' : 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]') 
                  : (isMine ? 'bg-white/40' : 'bg-gray-500/60')
              }`}
              style={{ 
                height: `${h}%`,
                opacity: (currentTime / (duration || 1)) > (i / waveHeights.length) ? 1 : 0.4,
                transform: isPlaying ? `scaleY(${0.8 + Math.random() * 0.4})` : 'scaleY(1)'
              }}
            />
          ))}
        </div>
        
        {/* Seekbar */}
        <input 
          type="range" 
          min="0" 
          max={duration || 100} 
          step="0.01"
          value={currentTime} 
          onChange={handleSeek}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="text-[10px] font-medium opacity-80 whitespace-nowrap min-w-[48px] text-right tracking-wider">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>
    </div>
  );
}
