import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useStore from '../../../store/useStore';
import { translations } from '../../../utils/translation';

export default function NotificationDropdown() {
  const { lang } = useStore();
  const t = translations[lang];
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const notiRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setShowNotiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
  );
}
