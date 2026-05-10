import React, { useState } from 'react';
import { X, Flag, AlertTriangle } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ReportModal({ isOpen, onClose, onReportSuccess }) {
  const { lang } = useStore();
  const t = translations[lang];
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const reasons = [
    { id: 'harassment', label: t.REPORT_REASON_HARASSMENT },
    { id: 'nudity', label: t.REPORT_REASON_NUDITY },
    { id: 'hate', label: t.REPORT_REASON_HATE_SPEECH },
    { id: 'spam', label: t.REPORT_REASON_SPAM },
    { id: 'other', label: t.REPORT_REASON_OTHER },
  ];

  const handleSubmit = () => {
    if (!selectedReason) return;
    
    // Simulate API call
    setTimeout(() => {
      // Create a toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-white text-neutral-900 px-6 py-3 rounded-full shadow-2xl font-medium animate-slide-up flex items-center gap-2';
      toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${t.REPORT_SUCCESS}</span>`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);

      onReportSuccess?.();
      onClose();
      setSelectedReason('');
      setDetails('');
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-white">
        <div className="px-6 py-5 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">{t.REPORT_USER}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-all active:scale-95 p-1 rounded-full hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-3">
            {reasons.map((reason) => (
              <label 
                key={reason.id} 
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedReason === reason.id ? 'border-rose-500 bg-rose-500/10' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReason === reason.id ? 'border-rose-500' : 'border-gray-500'}`}>
                  {selectedReason === reason.id && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                </div>
                <span className="text-sm font-medium">{reason.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t.REPORT_DETAILS_PLACEHOLDER}
              rows={2}
              maxLength={500}
              className="w-full bg-neutral-900 border border-neutral-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700"
              style={{ maxHeight: '100px' }}
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-all active:scale-95"
          >
            {t.CANCEL}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="flex-1 py-3 rounded-2xl font-bold bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {t.REPORT_SUBMIT}
          </button>
        </div>
      </div>
    </div>
  );
}
