import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ProfanityWarningModal() {
  const { lang, profanityWarning, setProfanityWarning } = useStore();
  
  if (profanityWarning === null) return null;

  const t = translations[lang];
  const isMuted = profanityWarning >= 5;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <div className="relative w-full max-w-sm bg-neutral-900 rounded-3xl shadow-2xl border border-rose-500/30 flex flex-col overflow-hidden animate-slide-up text-center p-6 sm:p-8">
        {!isMuted && (
          <button onClick={() => setProfanityWarning(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-800 z-10">
            <X className="w-5 h-5" />
          </button>
        )}

        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 ${isMuted ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
          {isMuted ? <ShieldAlert className="w-8 h-8 animate-pulse" /> : <AlertTriangle className="w-8 h-8" />}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-3">
          {isMuted ? t.PROFANITY_MUTED_TITLE : t.PROFANITY_WARNING_TITLE}
        </h3>
        
        <p className="text-sm text-gray-300 mb-8 leading-relaxed">
          {isMuted 
            ? t.PROFANITY_MUTED_DESC 
            : t.PROFANITY_WARNING_DESC.replace('{strike}', profanityWarning)}
        </p>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setProfanityWarning(null)}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all active:scale-95 shadow-lg ${isMuted ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/30'}`}
          >
            {isMuted ? t.OK : t.I_UNDERSTAND}
          </button>
        </div>
      </div>
    </div>
  );
}
