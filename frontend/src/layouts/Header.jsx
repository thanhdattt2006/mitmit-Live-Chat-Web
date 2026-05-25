import React, { useState } from 'react';
import { Video, MessageSquare, LogIn } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';
import ProfileModal from '../features/profile/ProfileModal';
import SettingsModal from '../features/profile/SettingsModal';
import LoginModal from '../features/auth/LoginModal';
import PrivateChatModal from '../features/inbox/PrivateChatModal';
import InboxDrawer from '../features/inbox/InboxDrawer';
import ConfirmModal from '../components/common/ConfirmModal';
import { useNavigate } from 'react-router-dom';

import CallModeTabs from './header/CallModeTabs';
import LanguageDropdown from './header/LanguageDropdown';
import NotificationDropdown from './header/NotificationDropdown';
import ProfileDropdown from './header/ProfileDropdown';

export default function Header() {
  const { 
    lang, onlineCount, isLoggedIn, 
    setInboxOpen, isInboxOpen, 
    isLoginModalOpen, setLoginModalOpen, 
    logout 
  } = useStore();
  
  const t = translations[lang];
  const navigate = useNavigate();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [activePrivateChat, setActivePrivateChat] = useState(null);

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutConfirmOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-800 glass-panel z-30 shrink-0">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer w-auto min-w-fit shrink-0">
          <div className="w-8 h-8 bg-white text-neutral-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-xl tracking-tight hidden sm:block shrink-0">
            {t.LOGO_TITLE}<span className="font-light text-gray-400">{t.LOGO_SUB}</span>
          </h1>
          <div className="hidden xl:flex ml-2 items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-800/30 text-emerald-400 text-xs font-medium whitespace-nowrap shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            {onlineCount.toLocaleString()} <span className="hidden lg:inline">{t.ONLINE_COUNT}</span>
          </div>
        </div>

        {/* Center: Call Mode Tabs */}
        <CallModeTabs />

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 w-auto min-w-fit justify-end shrink-0">
          
          <LanguageDropdown />

          <div className="w-px h-5 bg-neutral-700 hidden sm:block shrink-0"></div>

          {!isLoggedIn ? (
            <button 
              onClick={() => setLoginModalOpen(true)}
              className="ml-2 flex items-center gap-2 bg-white text-neutral-900 px-5 py-1.5 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-md shrink-0"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{t.LOGIN}</span>
            </button>
          ) : (
            <>
              <NotificationDropdown />

              {/* Inbox */}
              <button 
                onClick={() => setInboxOpen(true)}
                className="p-2 rounded-full hover:bg-neutral-800 transition-colors shrink-0"
              >
                <MessageSquare className="w-5 h-5 text-gray-300 shrink-0" />
              </button>

              <ProfileDropdown 
                onOpenProfile={() => setIsProfileModalOpen(true)} 
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onLogoutConfirm={() => setIsLogoutConfirmOpen(true)}
              />
            </>
          )}

        </div>
      </header>

      <InboxDrawer 
        isOpen={isInboxOpen} 
        onClose={() => setInboxOpen(false)} 
        onOpenPrivateChat={(friend) => { setInboxOpen(false); setActivePrivateChat(friend); }} 
      />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <PrivateChatModal isOpen={!!activePrivateChat} onClose={() => setActivePrivateChat(null)} friend={activePrivateChat} />
      
      <ConfirmModal 
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        title={t.LOGOUT}
        message={t.LOGOUT_CONFIRM_MSG}
        confirmText={t.LOGOUT}
        isDanger={true}
      />
    </>
  );
}
