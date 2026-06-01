import React from 'react';
import { X, Video } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function LoginModal({ isOpen, onClose }) {
  const { lang, login } = useStore();
  const t = translations[lang];

  if (!isOpen) return null;

  const handleLogin = () => {
    try {
      login();
      onClose();
    } catch (error) {
      console.error('Error during login:', error);
    }
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
          <p className="text-gray-400 text-sm mt-2 text-center">{t.LOGIN_PROMPT}</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-2xl font-semibold hover:bg-gray-200 transition-colors active:scale-95 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.11 0 9.49-3.66 9.49-9.1c0-1.07-.16-1.8-.16-1.8z"/></svg>
            {t.CONTINUE_GOOGLE}
          </button>

          <button 
            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/github"}
            className="w-full flex items-center justify-center gap-3 bg-neutral-800 text-white py-3.5 rounded-2xl font-semibold hover:bg-neutral-700 transition-colors active:scale-95 shadow-md border border-neutral-700 mt-3"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
