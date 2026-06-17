import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { Star, X } from 'lucide-react';
import { translations } from '../../utils/translation';
import axiosClient from '../../api/axiosClient';
import toast from 'react-hot-toast';

export default function FeedbackModal() {
  const { userInfo, lang } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    if (!userInfo) return;
    const matchCount = userInfo.matchCount || 0;
    
    // Check if we should show the modal
    if (matchCount === 3 || (matchCount > 3 && (matchCount - 3) % 10 === 0)) {
      // Check local storage to ensure we don't show it multiple times for the same count
      const seenKey = `feedback_seen_${matchCount}`;
      if (!localStorage.getItem(seenKey)) {
        setIsOpen(true);
        localStorage.setItem(seenKey, 'true');
      }
    }
  }, [userInfo?.matchCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await axiosClient.post('/api/v1/feedbacks', { rating, comment });
      toast.success(t.FEEDBACK_SUCCESS);
      setIsOpen(false);
    } catch (error) {
      console.error('Lỗi gửi đánh giá:', error);
      toast.error(t.ERROR_OCCURRED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-slide-up text-white">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t.HOW_DO_YOU_FEEL}</h2>
          <p className="text-sm text-gray-400">
            {t.FEEDBACK_PROMPT_1}{userInfo?.matchCount || 0}{t.FEEDBACK_PROMPT_2}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star 
                className={`w-10 h-10 transition-colors duration-200 ${
                  star <= (hoverRating || rating) 
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                    : 'text-neutral-700'
                }`} 
              />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.FEEDBACK_PLACEHOLDER}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
            rows="3"
            maxLength="500"
          ></textarea>
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full py-3.5 bg-white text-black font-semibold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSubmitting ? <span className="animate-pulse">{t.SENDING}</span> : t.SUBMIT_FEEDBACK}
        </button>
      </div>
    </div>
  );
}
