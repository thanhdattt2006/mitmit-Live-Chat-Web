import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import ReportModal from '../../components/common/ReportModal';
import VideoChatControls from './VideoChatControls';
import LocalStreamPreview from './LocalStreamPreview';
import RemoteStreamVideo from './RemoteStreamVideo';
import TimerCountdownOverlay from './TimerCountdownOverlay';

export default function VideoChat() {
  const { 
    lang, isMatching, isConnected, startMatching, stopCall, clearMessages, callMode, 
    localStream, setLocalStream, isLoggedIn, selectedCameraId, selectedMicId, remoteStream,
    isMatched, remoteUserInfo, sendMatchDecision, partnerDisconnectedTrigger, remoteUserId, userInfo, setLoginModalOpen
  } = useStore();
  
  const t = translations[lang];

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [strangerImg] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isLikedByMe, setIsLikedByMe] = useState(false);
  const [showPremiumMatch, setShowPremiumMatch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isIdle = !isMatching && !isConnected;
  const displayStrangerImg = remoteUserInfo?.avatarUrl || strangerImg || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80';

  const handleGuestAction = (actionCallback) => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
      return;
    }
    actionCallback();
  };

  useEffect(() => {
    if (!isConnected || isMatched) return;
    if (timeLeft <= 0) {
      handleStartNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [isConnected, isMatched, timeLeft]);

  useEffect(() => {
    if (isMatched) {
      setShowPremiumMatch(true);
      const timer = setTimeout(() => setShowPremiumMatch(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isMatched]);

  const handleStartNext = async () => {
    handleGuestAction(async () => {
      try {
        // CLEAR SẠCH TÀN DƯ TRƯỚC KHI TÌM MỚI (Fix lỗi Freeze)
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
        stopCall();

        if (callMode !== 'text') {
          try {
            const constraints = {
              video: callMode === 'video' ? {
                deviceId: selectedCameraId ? { exact: selectedCameraId } : undefined,
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 24, max: 30 }
              } : false,
              audio: {
                deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
                echoCancellation: true,
                noiseSuppression: true
              }
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            setLocalStream(stream);
          } catch (err) {
            console.warn("Camera/Mic access error, creating fallback fake stream:", err);
            const tracks = [];
            if (callMode === 'video') {
              const canvas = document.createElement('canvas');
              canvas.width = 640;
              canvas.height = 480;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = '#262626';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#a3a3a3';
              ctx.font = '24px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('Camera in use / unavailable', canvas.width / 2, canvas.height / 2);
              const canvasStream = canvas.captureStream(15);
              if (canvasStream.getVideoTracks().length > 0) {
                tracks.push(canvasStream.getVideoTracks()[0]);
              }
            }
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
              const audioCtx = new AudioContext();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              gainNode.gain.value = 0;
              const dst = audioCtx.createMediaStreamDestination();
              oscillator.connect(gainNode);
              gainNode.connect(dst);
              oscillator.start();
              if (dst.stream.getAudioTracks().length > 0) {
                tracks.push(dst.stream.getAudioTracks()[0]);
              }
            }
            const fakeStream = new MediaStream(tracks);
            setLocalStream(fakeStream);
          }
        }
        setTimeLeft(180);
        await startMatching();
        clearMessages();
        setIsLikedByMe(false);
        setShowPremiumMatch(false);
      } catch (error) {
        console.error('Error starting next match:', error);
      }
    });
  };

  useEffect(() => {
    if (partnerDisconnectedTrigger && isConnected && !isMatched) {
      handleStartNext();
    }
  }, [partnerDisconnectedTrigger]);

  const handleStop = () => {
    try {
      stopCall();
      clearMessages();
      setIsLikedByMe(false);
      setShowPremiumMatch(false);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  };

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => { track.enabled = isMicOn; });
    }
  }, [isMicOn, localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => { track.enabled = isCamOn; });
    }
  }, [isCamOn, localStream]);

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const handleHeartClick = () => {
    handleGuestAction(async () => {
      try {
        if (isLikedByMe || isMatched) return;
        setIsLikedByMe(true);
        await sendMatchDecision();
      } catch (error) {
        console.error('Error processing heart click:', error);
      }
    });
  };

  return (
    <section className="flex-1 relative lg:rounded-3xl overflow-hidden bg-black lg:bg-neutral-900 lg:border border-neutral-800 lg:shadow-sm flex items-center justify-center h-full min-w-0">
      <RemoteStreamVideo ref={remoteVideoRef} strangerImg={strangerImg} />
      
      {/* Loading Overlay */}
      <div className={`absolute inset-0 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 text-white z-20 p-4 ${isMatching ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <Loader2 className="animate-spin w-10 h-10 mb-3 text-white shrink-0" />
        <p className="font-medium tracking-wide animate-pulse text-center">{t.FINDING_SOMEONE}</p>
      </div>

      {/* Premium Match Overlay */}
      {showPremiumMatch && (
        <div className="fixed inset-0 flex items-center justify-center flex-col p-6 z-[9999] bg-black/80 backdrop-blur-sm animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-center px-4 leading-tight tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-8">
            {t.MATCH_SUCCESS.toUpperCase()}
          </h1>
          <div className="flex items-center gap-4">
            <img src={userInfo?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"} alt="You" className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-2xl relative z-10 animate-bounce" />
            <img src={displayStrangerImg} alt="Stranger" className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-2xl relative z-10 animate-bounce delay-150" />
          </div>
        </div>
      )}

      <LocalStreamPreview ref={localVideoRef} />
      <TimerCountdownOverlay timeLeft={timeLeft} />

      <VideoChatControls 
        isIdle={isIdle}
        isMatching={isMatching}
        callMode={callMode}
        isMicOn={isMicOn}
        isCamOn={isCamOn}
        setIsMicOn={setIsMicOn}
        setIsCamOn={setIsCamOn}
        handleGuestAction={handleGuestAction}
        setShowReportModal={setShowReportModal}
        handleHeartClick={handleHeartClick}
        isLikedByMe={isLikedByMe}
        isMatched={isMatched}
        handleStop={handleStop}
        handleStartNext={handleStartNext}
        lang={lang}
      />

      <ReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} reportedUserId={remoteUserId} onReportSuccess={handleStartNext} />
    </section>
  );
}
