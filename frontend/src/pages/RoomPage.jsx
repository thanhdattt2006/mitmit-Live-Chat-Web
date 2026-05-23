import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import VideoChat from '../features/chat/VideoChat';
import MessageList from '../features/chat/MessageList';
import ChatInput from '../features/chat/ChatInput';
import TimerMatchButton from '../components/common/TimerMatchButton';
import { translations } from '../utils/translation';
import { MessageCircle, Play, Loader2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import ReportModal from '../components/common/ReportModal';

export default function RoomPage() {
  const navigate = useNavigate();
  const { 
    lang, callMode, 
    isConnected, isMatching, startMatching, setConnected, clearMessages, addMessage,
    isLoggedIn, setLoginModalOpen, setMatching
  } = useStore();
  const t = translations[lang];

  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const menuRef = React.useRef(null);

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
    // Auto popup login modal on first load if not logged in
    const hasPrompted = sessionStorage.getItem('hasPromptedLogin');
    if (!isLoggedIn && !hasPrompted) {
      setLoginModalOpen(true);
      sessionStorage.setItem('hasPromptedLogin', 'true');
    }
  }, [isLoggedIn, setLoginModalOpen]);

  const handleStart = () => {
    try {
      startMatching();
      clearMessages();
      
      // Fake a connection after 1.5s if it's text mode for demo purposes,
      // but the actual store startMatching already handles it.
      if (callMode === 'text') {
        setTimeout(() => {
          setConnected(true);
          addMessage({ id: Date.now().toString(), type: 'system', text: t.SYSTEM_MSG_HELLO });
        }, 1500);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setMatching(false);
    }
  };

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

  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 relative">
      
      {isConnected ? (
        <>
          {/* LEFT: Video/Voice Area */}
          <div className="flex-1 relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm flex flex-col min-h-0">
            <TimerMatchButton 
              onTimeUp={() => handleStart()}
              onMatch={() => console.log('Matched!')}
            />
            <VideoChat />
          </div>

          {/* RIGHT: Chat Text Area */}
          <section className="flex-1 lg:flex-none w-full lg:w-[350px] xl:w-[400px] flex flex-col bg-[#141414] rounded-3xl border border-neutral-800 shadow-sm overflow-hidden min-h-0">
            {/* Header of Chat Area */}
            <div className="px-5 py-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-10 shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover border border-neutral-700" alt="Stranger" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{t.STRANGER} <span className="text-xs text-gray-500 font-normal">#8429</span></h3>
                    <span className="px-1.5 py-0.5 bg-neutral-800 rounded-full text-[10px] text-gray-300 border border-neutral-700 flex items-center gap-1 shrink-0">
                      21 <span className="text-blue-400 font-bold">♂</span>
                    </span>
                  </div>
                  <p className="text-xs text-green-400 font-medium truncate">{t.ONLINE_COUNT}</p>
                </div>
              </div>
              
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
            
            {/* Messages & Input */}
            <MessageList />
            <ChatInput />
          </section>
        </>
      ) : (
        /* DISCONNECTED STATE (Ready to connect) */
        <div className="flex-1 flex flex-col items-center justify-center bg-[#141414] rounded-3xl border border-neutral-800 text-center p-6 relative w-full h-full">
          {isMatching ? (
            <div className="flex flex-col items-center animate-fade-in">
              <Loader2 className="animate-spin w-12 h-12 mb-4 text-white shrink-0" />
              <p className="font-medium tracking-wide animate-pulse text-lg">{t.FINDING_SOMEONE}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-fade-in w-full max-w-sm">
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-neutral-700 shrink-0">
                <MessageCircle className="w-12 h-12 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{t.READY_TO_CONNECT}</h2>
              <p className="text-gray-400 text-sm mb-8 px-4">{t.PRESS_START}</p>
              
              <button 
                onClick={handleStart} 
                className="w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg bg-white text-neutral-900 hover:bg-gray-200 text-lg shrink-0"
              >
                <Play className="w-5 h-5 fill-current shrink-0" />
                <span>{t.START_BUTTON}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onReportSuccess={() => handleStart()} 
      />
    </div>
  );
}

