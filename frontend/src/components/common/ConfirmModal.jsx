import React from 'react';
import { AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isDanger = false }) {
  const { lang } = useStore();
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-center p-6 sm:p-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${isDanger ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-8">{message}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-2 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-all active:scale-95 whitespace-nowrap truncate"
          >
            {cancelText || t.CANCEL}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-3 px-2 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg whitespace-nowrap truncate ${isDanger ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'}`}
          >
            {confirmText || t.CONFIRM}
          </button>
        </div>
      </div>
    </div>
  );
}
