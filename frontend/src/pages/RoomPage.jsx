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

export default function RoomPage() {
  const { 
    lang, callMode, isConnected, remoteUserInfo, remoteUserId, startMatching, stopCall, clearMessages,
    isLoggedIn, setLoginModalOpen, setMatching, isMatched
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
    const hasPrompted = sessionStorage.getItem('hasPromptedLogin');
    if (!isLoggedIn && !hasPrompted) {
      setLoginModalOpen(true);
      sessionStorage.setItem('hasPromptedLogin', 'true');
    }
  }, [isLoggedIn, setLoginModalOpen]);

  const handleGuestAction = (actionCallback) => {
    if (!isLoggedIn) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-slide-up flex items-center gap-2';
      toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> <span>${t.LOGIN_REQUIRED}</span>`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
      return;
    }
    actionCallback();
  };

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

  return (
    <div className={`flex-1 flex flex-col ${callMode === 'text' ? 'items-center p-4' : 'lg:flex-row'} w-full gap-4 overflow-clip relative`}>
      {callMode !== 'text' && <VideoChat />}

      <section className={`w-full flex-col bg-[#141414] rounded-3xl border border-neutral-800 shadow-sm h-full flex-shrink-0 transition-all duration-500 relative ${callMode === 'text' ? 'flex max-w-3xl mx-auto border-2 border-neutral-800' : 'hidden lg:flex lg:w-[30%] lg:min-w-[350px] lg:max-w-[400px]'}`}>
        {isConnected ? (
          <>
            <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm z-10 relative shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img src={isMatched ? (remoteUserInfo?.avatarUrl || "https://via.placeholder.com/150") : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"} className="w-10 h-10 rounded-full object-cover border border-neutral-700" alt="Stranger" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">
                      {isMatched ? (remoteUserInfo?.name || t.STRANGER) : t.STRANGER}
                    </h3>
                    <span className="px-1.5 py-0.5 bg-neutral-800 rounded-full text-[10px] text-gray-300 border border-neutral-700 flex items-center gap-1 shrink-0">
                      21 <span className="text-blue-400 font-bold">♂</span>
                    </span>
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
                        onClick={() => handleGuestAction(() => { setShowReportModal(true); setShowMoreMenu(false); })}
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
