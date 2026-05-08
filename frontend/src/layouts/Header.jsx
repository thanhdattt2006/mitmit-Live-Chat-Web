import React, { useState } from 'react';
import { Video, Globe, Zap, Coins, Moon, Sun, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';
import Modal from '../components/common/Modal';

export default function Header() {
  const { theme, toggleTheme, lang, setLang, onlineCount, chatQuota, addQuota } = useStore();
  const t = translations[lang];
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaid(true);
      addQuota(100);
      setTimeout(() => {
        setIsPaymentOpen(false);
        setTimeout(() => setPaid(false), 300);
      }, 1000);
    }, 1500);
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-neutral-800 glass-panel z-20 shrink-0">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm">
            <Video className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-xl tracking-tight">
            {t.LOGO_TITLE}<span className="font-light text-gray-500 dark:text-gray-400">{t.LOGO_SUB}</span>
          </h1>
          <div className="hidden md:flex ml-4 items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            {onlineCount.toLocaleString()} {t.ONLINE_COUNT}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 text-sm font-medium hover:text-gray-500 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{lang.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showLangDropdown && (
              <div className="absolute right-0 mt-2 py-1 w-24 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-gray-200 dark:border-neutral-800 z-50">
                <button onClick={() => { setLang('en'); setShowLangDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">EN</button>
                <button onClick={() => { setLang('vi'); setShowLangDropdown(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors">VI</button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700"></div>

          <div className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 transition-colors">
            <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-semibold">{chatQuota}/10</span>
            <span className="text-gray-500 text-xs ml-1 hidden sm:inline">{t.FREE_CHATS}</span>
          </div>

          <button 
            onClick={() => setIsPaymentOpen(true)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-gray-200 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
          >
            <Coins className="w-4 h-4" />
            <span className="hidden sm:inline">{t.RECHARGE}</span>
          </button>

          <div className="w-px h-5 bg-gray-300 dark:bg-neutral-700"></div>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors group"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-400 group-hover:text-white" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 group-hover:text-black" />
            )}
          </button>
        </div>
      </header>

      <Modal isOpen={isPaymentOpen} onClose={() => !isPaying && setIsPaymentOpen(false)} title={t.PAYMENT_TITLE}>
        <div className="flex flex-col gap-4">
          <div className="text-center mb-2">
             <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full mb-3">
               <Coins className="w-6 h-6" />
             </div>
             <p className="text-sm text-gray-500 dark:text-gray-400">{t.PAYMENT_DESC}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="border-2 border-gray-200 dark:border-neutral-800 rounded-2xl p-4 cursor-pointer hover:border-neutral-900 dark:hover:border-white transition-colors">
               <h3 className="font-bold text-lg mb-1">100 <span className="text-xs text-gray-500">{t.COINS}</span></h3>
               <p className="text-sm font-semibold text-neutral-900 dark:text-white">$4.99</p>
             </div>
             <div className="border-2 border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 cursor-pointer relative overflow-hidden">
               <div className="absolute top-0 right-0 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">BEST VALUE</div>
               <h3 className="font-bold text-lg mb-1">500 <span className="text-xs text-gray-500">{t.COINS}</span></h3>
               <p className="text-sm font-semibold text-neutral-900 dark:text-white">$19.99</p>
             </div>
          </div>
          <button 
            onClick={handlePayment}
            disabled={isPaying || paid}
            className={`w-full py-3 mt-2 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${paid ? 'bg-green-500 text-white' : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:scale-[1.02] active:scale-95'}`}
          >
            {isPaying ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</> : 
             paid ? <><CheckCircle className="w-5 h-5" /> Thành công!</> : 
             t.PAY_NOW}
          </button>
        </div>
      </Modal>
    </>
  );
}
