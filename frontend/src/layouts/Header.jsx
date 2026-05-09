import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Globe, ChevronDown, 
  Bell, MessageSquare, User, LogOut, Settings,
  Mic, MessageCircle, X, LogIn
} from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';
import ProfileModal from '../features/profile/ProfileModal';
import SettingsModal from '../features/profile/SettingsModal';
import LoginModal from '../features/auth/LoginModal';
import PrivateChatModal from '../features/inbox/PrivateChatModal';
import InboxDrawer from '../features/inbox/InboxDrawer';

export default function Header() {
  const { 
    lang, setLang, onlineCount, callMode, setCallMode, userInfo, 
    isLoggedIn, login, logout,
    isMatching, isConnected, friends
  } = useStore();
  
  const t = translations[lang];
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const [activePrivateChat, setActivePrivateChat] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [userInfo?.avatar]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileDropdown(false);
      if (notiRef.current && !notiRef.current.contains(event.target)) setShowNotiDropdown(false);
      if (langRef.current && !langRef.current.contains(event.target)) setShowLangDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenProfile = () => {
    setShowProfileDropdown(false);
    setIsProfileModalOpen(true);
  };

  const handleOpenSettings = () => {
    setShowProfileDropdown(false);
    setIsSettingsModalOpen(true);
  };
  
  const handleOpenPrivateChat = (friend) => {
    setIsInboxOpen(false);
    setActivePrivateChat(friend);
  };

  const showCallTabs = !isMatching && !isConnected;

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-800 glass-panel z-30 shrink-0">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer w-auto lg:w-[250px] shrink-0">
          <div className="w-8 h-8 bg-white text-neutral-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-xl tracking-tight hidden sm:block shrink-0">
            {t.LOGO_TITLE}<span className="font-light text-gray-400">{t.LOGO_SUB}</span>
          </h1>
          {/* Use whitespace-nowrap and flexible padding for online count */}
          <div className="hidden xl:flex ml-2 items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-800/30 text-emerald-400 text-xs font-medium whitespace-nowrap shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            {onlineCount.toLocaleString()} <span className="hidden lg:inline">{t.ONLINE_COUNT}</span>
          </div>
        </div>

        {/* Center: Call Mode Tabs */}
        <div className={`transition-all duration-300 ease-in-out flex-1 flex justify-center min-w-0 ${showCallTabs ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`}>
          <div className="flex items-center bg-neutral-900 p-1 rounded-full border border-neutral-800">
            <button 
              onClick={() => setCallMode('video')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 ${callMode === 'video' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Video</span>
            </button>
            <button 
              onClick={() => setCallMode('voice')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 ${callMode === 'voice' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <Mic className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Voice</span>
            </button>
            <button 
              onClick={() => setCallMode('text')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 ${callMode === 'text' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Text</span>
            </button>
          </div>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-1 sm:gap-3 w-auto lg:w-[250px] justify-end shrink-0">
          
          <div className="relative shrink-0" ref={langRef}>
            <button 
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-sm font-medium hover:text-gray-300 transition-colors mr-2"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">{lang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 py-1 w-24 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 z-50 animate-fade-in">
                <button onClick={() => { setLang('en'); setShowLangDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-800 transition-colors">EN</button>
                <button onClick={() => { setLang('vi'); setShowLangDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-800 transition-colors">VI</button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-neutral-700 hidden sm:block shrink-0"></div>

          {!isLoggedIn ? (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="ml-2 flex items-center gap-2 bg-white text-neutral-900 px-5 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-md shrink-0"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t.LOGIN}</span>
            </button>
          ) : (
            <>
              {/* Notification */}
              <div className="relative shrink-0" ref={notiRef}>
                <button 
                  onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                  className="p-2 rounded-full hover:bg-neutral-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-300 shrink-0" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0a0a0a]"></span>
                </button>

                {showNotiDropdown && (
                  <div className="absolute right-0 mt-2 py-2 w-64 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 z-50 text-sm animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-800 font-semibold text-white truncate">{t.NOTIFICATIONS}</div>
                    <div className="p-4 text-gray-400 text-center truncate">{t.NO_NOTIFICATIONS}</div>
                  </div>
                )}
              </div>

              {/* Inbox */}
              <button 
                onClick={() => setIsInboxOpen(true)}
                className="p-2 rounded-full hover:bg-neutral-800 transition-colors shrink-0"
              >
                <MessageSquare className="w-5 h-5 text-gray-300 shrink-0" />
              </button>

              {/* Profile Avatar */}
              <div className="relative shrink-0" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 hover:ring-2 hover:ring-neutral-600 transition-all ml-1 shrink-0 bg-neutral-800"
                >
                  {avatarError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                      {getInitials(userInfo?.name)}
                    </div>
                  ) : (
                    <img 
                      src={userInfo?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80"} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  )}
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 py-1 w-44 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-neutral-800 mb-1">
                      <p className="font-semibold text-sm truncate">{userInfo?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userInfo?.city}</p>
                    </div>
                    <button onClick={handleOpenProfile} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors">
                      <User className="w-4 h-4 shrink-0" /> <span className="truncate">{t.PROFILE}</span>
                    </button>
                    <button onClick={handleOpenSettings} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors">
                      <Settings className="w-4 h-4 shrink-0" /> <span className="truncate">{t.SETTINGS}</span>
                    </button>
                    <div className="h-px bg-neutral-800 my-1"></div>
                    <button onClick={() => { logout(); setShowProfileDropdown(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="w-4 h-4 shrink-0" /> <span className="truncate">{t.LOGOUT}</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </header>

      <InboxDrawer isOpen={isInboxOpen} onClose={() => setIsInboxOpen(false)} onOpenPrivateChat={handleOpenPrivateChat} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <PrivateChatModal isOpen={!!activePrivateChat} onClose={() => setActivePrivateChat(null)} friend={activePrivateChat} />
    </>
  );
}
