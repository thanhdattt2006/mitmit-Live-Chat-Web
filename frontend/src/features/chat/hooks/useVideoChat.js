import { useState, useEffect } from 'react';
import useStore from '../../../store/useStore';
import { translations } from '../../../utils/translation';
import toast from 'react-hot-toast';
import strangerImg from '../../../assets/stranger.png';

export function useVideoChat() {
  const { 
    lang, isMatching, isConnected, startMatching, stopCall, clearMessages, callMode, 
    localStream, setLocalStream, isLoggedIn, selectedCameraId, selectedMicId, remoteStream,
    isMatched, remoteUserInfo, sendMatchDecision, partnerDisconnectedTrigger, remoteUserId, userInfo,
    matchEndTime
  } = useStore();
  
  const t = translations[lang];

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(180);

  const [isLikedByMe, setIsLikedByMe] = useState(false);
  const [showPremiumMatch, setShowPremiumMatch] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isIdle = !isMatching && !isConnected;
  const displayStrangerImg = remoteUserInfo?.avatarUrl || strangerImg;

  useEffect(() => {
    if (!isConnected || isMatched || !matchEndTime) return;
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((matchEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isConnected, isMatched, matchEndTime]);

  useEffect(() => {
    if (isMatched) {
      setShowPremiumMatch(true);
      const timer = setTimeout(() => setShowPremiumMatch(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isMatched]);

  const handleStartNext = async () => {
    try {
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
          console.error("Camera/Mic access denied or error:", err);
          toast.error(t.CAMERA_MIC_REQUIRED || "You must allow Camera/Mic to continue.");
          return;
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
  };

  useEffect(() => {
    if (partnerDisconnectedTrigger && isConnected) {
      if (!isMatched) {
        handleStartNext();
      } else {
        toast('Đối phương đã rời khỏi cuộc trò chuyện', { icon: '👋' });
        handleStop();
      }
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

  const handleHeartClick = async () => {
    try {
      if (isLikedByMe || isMatched) return;
      setIsLikedByMe(true);
      await sendMatchDecision();
    } catch (error) {
      console.error('Error processing heart click:', error);
    }
  };

  return {
    isMicOn, setIsMicOn,
    isCamOn, setIsCamOn,
    timeLeft,
    isLikedByMe, showPremiumMatch,
    showReportModal, setShowReportModal,
    isIdle, displayStrangerImg,
    handleStartNext, handleStop, handleHeartClick,
    lang, isMatching, callMode, isMatched, remoteUserId, userInfo, t
  };
}
