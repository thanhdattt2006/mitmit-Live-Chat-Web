import React, { useState } from 'react';
import { 
  Video, Globe, Moon, Sun, ChevronDown, 
  Bell, MessageSquare, User, LogOut, Settings,
  Mic, MessageCircle, X
} from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';

export default function Header() {
  const { theme, toggleTheme, lang, setLang, onlineCount, callMode, setCallMode } = useStore();
  const t = translations[lang];
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const mockFriends = [
    { id: 1, name: 'Anna Lee', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', lastMsg: 'Hey, are you there?' },
    { id: 2, name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80', lastMsg: 'Nice talking to you!' },
    { id: 3, name: 'Sarah Wu', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80', lastMsg: 'Let\'s video call later.' },
  ];

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 dark:border-neutral-800 glass-panel z-30 shrink-0">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer w-auto lg:w-[200px]">
          <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
            <Video className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-xl tracking-tight hidden sm:block">
            {t.LOGO_TITLE}<span className="font-light text-gray-500 dark:text-gray-400">{t.LOGO_SUB}</span>
          </h1>
          <div className="hidden xl:flex ml-2 items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            {onlineCount.toLocaleString()}
          </div>
        </div>

        {/* Center: Call Mode Tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-neutral-900 p-1 rounded-full border border-gray-200 dark:border-neutral-800">
          <button 
            onClick={() => setCallMode('video')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${callMode === 'video' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm text-neutral-900 dark:text-white' : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </button>
          <button 
            onClick={() => setCallMode('voice')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${callMode === 'voice' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm text-neutral-900 dark:text-white' : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice</span>
          </button>
          <button 
            onClick={() => setCallMode('text')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${callMode === 'text' ? 'bg-white dark:bg-[#1a1a1a] shadow-sm text-neutral-900 dark:text-white' : 'text-gray-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Text</span>
          </button>
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-1 sm:gap-3 w-auto lg:w-[200px] justify-end">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors group hidden sm:block"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-400 group-hover:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-black" />
            )}
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700 hidden sm:block"></div>

          {/* Notification */}
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-[#0a0a0a]"></span>
          </button>

          {/* Inbox */}
          <button 
            onClick={() => setIsInboxOpen(true)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Profile Avatar */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-neutral-700 hover:ring-2 hover:ring-neutral-300 dark:hover:ring-neutral-600 transition-all ml-1"
            >
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 py-1 w-40 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 z-50">
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <div className="h-px bg-gray-200 dark:bg-neutral-800 my-1"></div>
                <button className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-over Drawer for Inbox */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isInboxOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInboxOpen(false)}></div>
        <div className={`absolute top-0 right-0 h-full w-full sm:w-80 bg-white dark:bg-[#141414] shadow-2xl border-l border-gray-200 dark:border-neutral-800 transform transition-transform duration-300 ease-out flex flex-col ${isInboxOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900/50 backdrop-blur-sm">
            <h2 className="font-bold text-lg">Inbox</h2>
            <button onClick={() => setIsInboxOpen(false)} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {mockFriends.map(friend => (
              <div key={friend.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors mb-1">
                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-neutral-700" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{friend.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{friend.lastMsg}</p>
                </div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
