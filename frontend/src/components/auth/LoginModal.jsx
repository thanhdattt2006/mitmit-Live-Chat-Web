import React from 'react';
import { X, Video } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function LoginModal({ isOpen, onClose }) {
  const { lang, login } = useStore();
  const t = translations[lang];

  if (!isOpen) return null;

  const handleLogin = () => {
    login();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden animate-slide-up text-white p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-neutral-800">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-8 mt-2">
          <div className="w-12 h-12 bg-white text-neutral-900 rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm mb-4">
            <Video className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold">{t.ONBOARDING_GREETING}</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">Login to connect with strangers around the world</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-2xl font-semibold hover:bg-gray-200 transition-colors active:scale-95 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.11 0 9.49-3.66 9.49-9.1c0-1.07-.16-1.8-.16-1.8z"/></svg>
            {t.CONTINUE_GOOGLE}
          </button>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-neutral-800 text-white py-3.5 rounded-2xl font-semibold hover:bg-neutral-700 transition-colors active:scale-95 shadow-md border border-neutral-700"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            {t.CONTINUE_GITHUB}
          </button>
        </div>
      </div>
    </div>
  );
}
