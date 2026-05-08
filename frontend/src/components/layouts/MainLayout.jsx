import { useState, useEffect } from 'react';
import { Sun, Moon, Coins, MessageCircle } from 'lucide-react';
import useRoomStore from '../../store/useRoomStore';

export default function MainLayout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const { coins, freeChats } = useRoomStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-white/20 dark:border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <div className="flex items-center gap-2 select-none">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 blur-lg opacity-60 rounded-full" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                OmeTV
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Free Chats Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold whitespace-nowrap">
                  {freeChats}/10 Free Chats
                </span>
              </div>

              {/* Coins Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400">
                <Coins className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">{coins.toLocaleString()}</span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                id="theme-toggle-btn"
                onClick={() => setIsDark((v) => !v)}
                className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:scale-110 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
