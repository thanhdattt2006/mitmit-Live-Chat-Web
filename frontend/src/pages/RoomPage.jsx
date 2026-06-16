import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import VideoChat from '../features/chat/VideoChat';
import MessageList from '../features/chat/MessageList';
import ChatInput from '../features/chat/ChatInput';
import TextChatControls from '../features/chat/TextChatControls';
import MatchStatusOverlay from '../features/chat/MatchStatusOverlay';
import { translations } from '../utils/translation';
import { MoreHorizontal, AlertTriangle } from 'lucide-react';
import ReportModal from '../components/common/ReportModal';
import toast from 'react-hot-toast';
import strangerImg from '../assets/stranger.png';

export default function RoomPage() {
  const { 
    lang, callMode, isConnected, remoteUserInfo, remoteUserId, startMatching, stopCall, clearMessages,
    isLoggedIn, setLoginModalOpen, setMatching, isMatched, partnerDisconnectedTrigger
  } = useStore();
  const t = translations[lang];

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoginModalOpen(true);
    }
  }, [isLoggedIn, setLoginModalOpen]);

  useEffect(() => {
    if (callMode === 'text' && partnerDisconnectedTrigger && isConnected) {
      if (!isMatched) {
        handleStartNextText();
      } else {
        toast('Đối phương đã rời khỏi cuộc trò chuyện', { icon: '👋' });
        handleStopText();
      }
    }
  }, [partnerDisconnectedTrigger, callMode, isConnected, isMatched]);

  const handleStartNextText = () => {
    try {
      clearMessages();
      startMatching();
    } catch (error) {
      console.error('Error starting next text chat:', error);
      setMatching(false);
    }
  };

  const handleStopText = () => {
    try {
      stopCall();
      clearMessages();
    } catch (error) {
      console.error('Error stopping text chat:', error);
      setMatching(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="flex-1 bg-black w-full h-full flex items-center justify-center"></div>;
  }

  return (
    <div className={`flex-1 min-h-0 flex flex-col ${callMode === 'text' ? 'items-center p-4' : 'lg:flex-row lg:p-4'} w-full lg:gap-4 overflow-clip relative bg-black lg:bg-transparent`}>
      {callMode !== 'text' && <VideoChat />}

      <section className={`w-full flex-col bg-[#141414] shadow-sm transition-all duration-500 relative overflow-hidden ${callMode === 'text' ? 'flex max-w-3xl mx-auto rounded-3xl border-2 border-neutral-800 h-full' : `${isConnected ? 'flex' : 'hidden'} lg:flex h-[40dvh] lg:h-full lg:w-[30%] lg:min-w-[350px] lg:max-w-[400px] rounded-t-3xl lg:rounded-3xl border-t lg:border border-neutral-800 shrink-0 z-20`}`}>
        {isConnected ? (
          <>
            <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm z-10 relative shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img 
                    src={remoteUserInfo?.avatarUrl || strangerImg} 
                    onError={(e) => { e.target.onerror = null; e.target.src = strangerImg; }}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-700 bg-neutral-800" 
                    alt="Stranger" 
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {remoteUserInfo?.name || t.STRANGER}
                    </h3>
                  </div>
                  <p className="text-xs text-green-400 font-medium truncate">{t.ONLINE_COUNT}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <TextChatControls handleStopText={handleStopText} handleStartNextText={handleStartNextText} />
                
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMoreMenu(!showMoreMenu)} 
                    className="text-gray-400 hover:text-white transition-all active:scale-95 p-1.5 rounded-full hover:bg-neutral-800 shrink-0 ml-1"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  
                  {showMoreMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-[9999] animate-slide-up origin-top-right p-1">
                      <button 
                        onClick={() => { setShowReportModal(true); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        {t.REPORT_USER}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <MessageList />
            <ChatInput />
          </>
        ) : (
          <MatchStatusOverlay handleStartNextText={handleStartNextText} />
        )}
      </section>

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        reportedUserId={remoteUserId}
        onReportSuccess={callMode === 'text' ? handleStartNextText : undefined} 
      />
    </div>
  );
}
