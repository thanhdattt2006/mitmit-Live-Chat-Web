import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import useStore from '../../../store/useStore';

export default function LanguageDropdown() {
  const { lang, setLang } = useStore();
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
  );
}
