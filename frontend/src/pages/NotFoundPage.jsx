import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { lang } = useStore();
  const t = translations[lang] || translations['vi'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative z-10 w-full h-full text-center px-4">
      <div className="max-w-md w-full animate-fade-in flex flex-col items-center">
        <img 
          src="/404-not-found.png" 
          alt="404 Not Found" 
          className="w-full max-w-[280px] h-auto object-contain mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        />
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">404</h1>
        <p className="text-gray-400 text-lg mb-8">
          Opps! Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-gray-200 transition-all active:scale-95 shadow-lg flex items-center gap-2"
        >
          Trở về trang chủ
        </button>
      </div>
    </div>
  );
}
