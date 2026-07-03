import React from 'react';
import { X, MessageSquare, Star } from 'lucide-react';

export default function FeedbackDetailsModal({ isOpen, onClose, feedback, t }) {
  if (!isOpen || !feedback) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-neutral-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slide-up text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-800 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">{t.FEEDBACK_DETAILS}{feedback.id}</h2>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <img src={feedback.avatarUrl || 'https://via.placeholder.com/150'} className="w-12 h-12 rounded-full border border-white/10" alt="" />
            <div>
              <p className="font-semibold text-lg">{feedback.userName}</p>
              <p className="text-sm text-gray-400">{new Date(feedback.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">{t.RATING}</p>
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-6 h-6 ${i < feedback.rating ? 'fill-current' : 'text-gray-600'}`} />
              ))}
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-sm text-gray-400 mb-2">{t.DETAIL_CONTENT}</p>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
              {feedback.comment || <span className="text-gray-500 italic">{t.NO_TEXT_CONTENT}</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
