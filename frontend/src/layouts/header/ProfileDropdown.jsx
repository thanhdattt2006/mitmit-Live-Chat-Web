import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ProfileDropdown({ onOpenProfile, onOpenSettings, onLogoutConfirm }) {
  const { lang, userInfo } = useStore();
  const t = translations[lang];
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setAvatarError(false);
  }, [userInfo?.avatarUrl]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const roleText = userInfo?.role === 'ADMIN' ? t.ADMIN : t.MEMBER;

  return (
    <div className="relative shrink-0" ref={profileRef}>
      <button 
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className="w-8 h-8 rounded-full overflow-hidden border border-neutral-700 hover:ring-2 hover:ring-neutral-600 transition-all ml-1 shrink-0 bg-neutral-800"
      >
        {avatarError || !userInfo?.avatarUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
            {getInitials(userInfo?.name)}
          </div>
        ) : (
          <img 
            src={userInfo.avatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        )}
      </button>

      {showProfileDropdown && (
        <div className="absolute right-0 mt-2 py-1 w-44 bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-neutral-800 mb-1">
            <p className="font-semibold text-sm truncate">{userInfo?.name || 'User'}</p>
            {/* Đã xóa mock city, sử dụng Role thay thế */}
            <p className="text-xs text-emerald-400 truncate">{roleText}</p>
          </div>
          <button onClick={() => { setShowProfileDropdown(false); onOpenProfile(); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors">
            <User className="w-4 h-4 shrink-0" /> <span className="truncate">{t.PROFILE}</span>
          </button>
          <button onClick={() => { setShowProfileDropdown(false); onOpenSettings(); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-neutral-800 transition-colors">
            <Settings className="w-4 h-4 shrink-0" /> <span className="truncate">{t.SETTINGS}</span>
          </button>
          <div className="h-px bg-neutral-800 my-1"></div>
          <button onClick={() => { setShowProfileDropdown(false); onLogoutConfirm(); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 transition-colors">
            <LogOut className="w-4 h-4 shrink-0" /> <span className="truncate">{t.LOGOUT}</span>
          </button>
        </div>
      )}
    </div>
  );
}
