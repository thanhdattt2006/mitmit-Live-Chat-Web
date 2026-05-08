import { useState, useEffect, useRef } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Flag, Send, Sun, Moon,
  SkipForward, Loader2, MessageCircle, Coins,
} from 'lucide-react';
import { clsx } from 'clsx';

// ─── Mock initial messages ────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  { id: '1', text: 'Xin chào! 👋', isMe: false },
  { id: '2', text: 'Chào bạn, bạn từ đâu vậy?', isMe: true },
  { id: '3', text: 'Mình từ Hà Nội, còn bạn?', isMe: false },
  { id: '4', text: 'Mình ở TP.HCM nè! 🌆', isMe: true },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  return (
    <div className={clsx('flex', msg.isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[78%] px-4 py-2.5 text-sm leading-relaxed shadow-sm',
          msg.isMe
            ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm'
            : 'bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-sm'
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────
function ChatPanel({ messages, onSend }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-zinc-700/50 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3.5 border-b border-gray-200/80 dark:border-zinc-700/50">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-zinc-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
          Live Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 dark:text-zinc-600">
            <span className="text-3xl">💬</span>
            <span className="text-sm">Chưa có tin nhắn</span>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200/80 dark:border-zinc-700/50">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5">
          <input
            id="chat-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn gì đó..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
          />
          <button
            id="send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Gửi tin nhắn"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-110 shadow-md shadow-blue-500/30 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Toolbar ─────────────────────────────────────────────────────────
function VideoToolbar({ isMicOn, isCamOn, onToggleMic, onToggleCam, onNext }) {
  const iconBtn = (active, label, icon) => (
    <button
      aria-label={label}
      onClick={active === 'mic' ? onToggleMic : onToggleCam}
      className={clsx(
        'w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 shadow-md',
        (active === 'mic' ? isMicOn : isCamOn)
          ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
          : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
      )}
    >
      {icon}
    </button>
  );

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Mic */}
      <button
        id="mic-toggle-btn"
        aria-label="Bật/tắt mic"
        onClick={onToggleMic}
        className={clsx(
          'w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 shadow-md',
          isMicOn
            ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
            : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
        )}
      >
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera */}
      <button
        id="cam-toggle-btn"
        aria-label="Bật/tắt camera"
        onClick={onToggleCam}
        className={clsx(
          'w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 shadow-md',
          isCamOn
            ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
            : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
        )}
      >
        {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* NEXT */}
      <button
        id="next-btn"
        aria-label="Bỏ qua"
        onClick={onNext}
        className="flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm tracking-widest shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <SkipForward className="w-4 h-4" />
        NEXT
      </button>

      {/* Report */}
      <button
        id="report-btn"
        aria-label="Báo cáo"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 border border-white/20 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 hover:border-rose-400/50 transition-all duration-200 hover:scale-110 shadow-md"
      >
        <Flag className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ isDark, onToggleDark }) {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-black/60 border-b border-white/30 dark:border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 blur-lg opacity-50 rounded-full" />
              <div className="relative w-9 h-9 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
              OmeTV Clone
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.9)] animate-pulse" />
              <span className="text-xs font-semibold">1,204 Online</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              aria-label="Chuyển đổi giao diện"
              onClick={onToggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:scale-110 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all duration-200 shadow-sm"
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-500" />
              }
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Root Room Page ───────────────────────────────────────────────────────────
export default function Room() {
  // ── Dark mode (self-contained) ──────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

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

  // ── Local state ─────────────────────────────────────────────────────────────
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  // ── Auto-connect simulation ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isMatching) return;
    const t = setTimeout(() => {
      setIsMatching(false);
      setIsConnected(true);
      setMessages([]);
    }, 2000);
    return () => clearTimeout(t);
  }, [isMatching]);

  const handleNext = () => {
    setIsConnected(false);
    setIsMatching(true);
    setMessages([]);
  };

  const handleStart = () => {
    setIsMatching(true);
    setMessages([]);
  };

  const handleSend = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text, isMe: true },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />

      {/* Page body */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4" style={{ height: 'calc(100vh - 5.5rem)' }}>

          {/* ── LEFT · Video (70%) ── */}
          <div className="flex-1 lg:flex-[7] flex flex-col min-h-0">
            <div className="relative flex-1 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-zinc-700/40">

              {/* Stranger feed */}
              {isConnected ? (
                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-zinc-700 mx-auto flex items-center justify-center text-4xl shadow-inner">
                      😊
                    </div>
                    <p className="text-zinc-400 text-sm font-medium tracking-wide">Đã kết nối</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isMatching ? (
                    <div className="text-center space-y-5">
                      <div className="relative mx-auto w-16 h-16">
                        <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                        <div className="relative w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center">
                          <Loader2 className="w-7 h-7 text-rose-400 animate-spin" />
                        </div>
                      </div>
                      <p className="text-zinc-300 text-lg font-semibold animate-pulse">
                        Đang kết nối...
                      </p>
                      <p className="text-zinc-500 text-sm">Vui lòng chờ trong giây lát</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="text-6xl">👥</div>
                      <div className="space-y-1.5">
                        <p className="text-zinc-200 text-2xl font-bold">Sẵn sàng chat?</p>
                        <p className="text-zinc-500 text-sm">Nhấn Start để gặp người lạ ngay</p>
                      </div>
                      <button
                        id="start-btn"
                        onClick={handleStart}
                        className="px-10 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-base rounded-full shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide"
                      >
                        🚀 Bắt Đầu Ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

              {/* PiP · Your camera */}
              <div className="absolute bottom-[4.5rem] right-3 sm:right-4 w-28 sm:w-36 aspect-video bg-zinc-800 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-2xl shadow-black/60 group transition-transform duration-200 hover:scale-105">
                <div className="w-full h-full bg-gradient-to-br from-indigo-900/80 to-violet-900/80 flex items-center justify-center">
                  <span className="text-2xl">🤳</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-white text-[10px] font-medium">You</span>
                </div>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max backdrop-blur-xl bg-black/50 border border-white/10 rounded-full px-4 py-2.5 shadow-2xl shadow-black/60">
                <VideoToolbar
                  isMicOn={isMicOn}
                  isCamOn={isCamOn}
                  onToggleMic={() => setIsMicOn((v) => !v)}
                  onToggleCam={() => setIsCamOn((v) => !v)}
                  onNext={handleNext}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT · Chat (30%) ── */}
          <div className="h-72 lg:h-auto lg:flex-[3] min-h-0">
            <ChatPanel messages={messages} onSend={handleSend} />
          </div>

        </div>
      </div>
    </div>
  );
}
