import React, { useRef, useState, useEffect } from 'react';
import { X, MoreHorizontal, AlertTriangle, UserMinus } from 'lucide-react';
import { translations } from '../../utils/translation';
import useStore from '../../store/useStore';

export default function PrivateChatHeader({ friend, onClose, setShowReportModal }) {
  const { lang, removeFriend, setInboxOpen } = useStore();
  const t = translations[lang];
  const menuRef = useRef(null);
  
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
        setShowUnfriendConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md sm:rounded-t-3xl relative z-20">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={friend.avatarUrl || 'https://via.placeholder.com/150'} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#141414]"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{friend.name}</h3>
            {/* Giữ nguyên tag giả định nếu chưa có API thật cho friend */}
            <span className="px-1.5 py-0.5 bg-neutral-800 rounded-full text-[10px] text-gray-300 border border-neutral-700 flex items-center gap-1 shrink-0">
              {friend.age || 21} <span className={`font-bold ${friend.gender === 'female' ? 'text-pink-400' : friend.gender === 'male' ? 'text-blue-400' : 'text-purple-400'}`}>
                {friend.gender === 'female' ? '♀' : friend.gender === 'male' ? '♂' : '⚥'}
              </span>
            </span>
          </div>
          <p className="text-[10px] text-green-400">{t.PRIVATE_CHAT}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {showMoreMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl z-[9999] animate-slide-up origin-top-right">
              {!showUnfriendConfirm ? (
                <div className="p-1">
                  <button 
                    onClick={() => { setShowReportModal(true); setShowMoreMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    {t.REPORT_USER}
                  </button>
                  <button 
                    onClick={() => setShowUnfriendConfirm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                    {t.UNFRIEND}
                  </button>
                </div>
              ) : (
                <div className="p-3 text-center">
                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">{t.UNFRIEND_CONFIRM}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowUnfriendConfirm(false)}
                      className="flex-1 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                      {t.CANCEL}
                    </button>
                    <button 
                      onClick={() => { 
                        removeFriend(friend.id); 
                        onClose(); 
                        setInboxOpen(false);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                    >
                      {t.OK}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
