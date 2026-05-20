import React from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function InboxDrawer({ isOpen, onClose, onOpenPrivateChat }) {
  const { friends, lang } = useStore();
  const t = translations[lang];

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-full sm:w-80 bg-[#141414] shadow-2xl border-l border-neutral-800 transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm">
          <h2 className="font-bold text-lg truncate pr-4">{t.INBOX}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-800 transition-all active:scale-95 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {friends?.map(friend => (
            <div 
              key={friend.id} 
              onClick={() => onOpenPrivateChat(friend)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-800/50 cursor-pointer transition-colors mb-1"
            >
              <img src={friend.avatarUrl || 'https://via.placeholder.com/150'} alt={friend.name} className="w-12 h-12 rounded-full object-cover border border-neutral-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate text-white">{friend.name}</h4>
                <p className="text-xs text-gray-500 truncate">{friend.lastMsg}</p>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
