import { useRef, useEffect, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Flag, Coins,
  Send, SkipForward, ChevronRight, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import useRoomStore from '../store/useRoomStore';

// ─── Chat Message Bubble ────────────────────────────────────────────────────
function MessageBubble({ message }) {
  return (
    <div className={clsx('flex', message.isMe ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm',
          message.isMe
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

// ─── Chat Panel ─────────────────────────────────────────────────────────────
function ChatPanel() {
  const { messages, sendMessage } = useRoomStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed, true);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-950 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Chat Trực Tiếp
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 text-sm gap-2">
            <span className="text-2xl">💬</span>
            <span>Chưa có tin nhắn nào</span>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-2xl px-3 py-2">
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhắn gì đó..."
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-zinc-500 outline-none"
          />
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:scale-110 shadow-md shadow-blue-500/30 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Toolbar ───────────────────────────────────────────────────────────
function VideoToolbar({ onNext }) {
  const { isMicOn, isCamOn, toggleMic, toggleCam } = useRoomStore();

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {/* Mic Toggle */}
      <button
        id="mic-toggle-btn"
        onClick={toggleMic}
        className={clsx(
          'w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 shadow-lg',
          isMicOn
            ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
            : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
        )}
        aria-label="Toggle microphone"
      >
        {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </button>

      {/* Camera Toggle */}
      <button
        id="cam-toggle-btn"
        onClick={toggleCam}
        className={clsx(
          'w-11 h-11 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-110 shadow-lg',
          isCamOn
            ? 'bg-white/15 border-white/20 text-white hover:bg-white/25'
            : 'bg-red-500/80 border-red-400/50 text-white hover:bg-red-500'
        )}
        aria-label="Toggle camera"
      >
        {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>

      {/* NEXT Button */}
      <button
        id="next-stranger-btn"
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Skip to next stranger"
      >
        <SkipForward className="w-4 h-4" />
        NEXT
        <ChevronRight className="w-4 h-4 -ml-1" />
      </button>

      {/* Report */}
      <button
        id="report-btn"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-white/15 border border-white/20 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 hover:border-rose-400/40 transition-all duration-200 hover:scale-110 shadow-lg"
        aria-label="Report user"
      >
        <Flag className="w-5 h-5" />
      </button>

      {/* Nạp Xèng */}
      <button
        id="top-up-btn"
        className="w-11 h-11 flex items-center justify-center rounded-full bg-amber-500/80 border border-amber-400/50 text-white hover:bg-amber-500 hover:scale-110 transition-all duration-200 shadow-lg shadow-amber-500/30"
        aria-label="Top up coins"
      >
        <Coins className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Main Room Page ──────────────────────────────────────────────────────────
export default function Room() {
  const { isMatching, isConnected, skipToNext, startMatching, onConnected } = useRoomStore();

  // Simulate auto-connect after 2s when matching
  useEffect(() => {
    if (!isMatching) return;
    const timer = setTimeout(() => onConnected(), 2000);
    return () => clearTimeout(timer);
  }, [isMatching, onConnected]);

  const handleNext = () => {
    skipToNext();
  };

  const handleStart = () => {
    startMatching();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5.5rem)]">

        {/* ── LEFT: Video Area (70%) ── */}
        <div className="flex-1 lg:flex-[7] flex flex-col gap-3 min-h-0">
          {/* Main Video Frame */}
          <div className="relative flex-1 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-zinc-700/50">

            {/* Remote Video / Placeholder */}
            {isConnected ? (
              // Mock connected state – gray video
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-zinc-700 mx-auto flex items-center justify-center text-4xl">
                    😊
                  </div>
                  <p className="text-zinc-400 text-sm font-medium">Đã kết nối</p>
                </div>
              </div>
            ) : (
              // Waiting / Idle state
              <div className="w-full h-full flex flex-col items-center justify-center gap-5">
                {isMatching ? (
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-16 h-16">
                      <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                      <div className="relative w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-rose-400 animate-spin" />
                      </div>
                    </div>
                    <p className="text-zinc-300 text-lg font-semibold animate-pulse">
                      Đang tìm người lạ...
                    </p>
                    <p className="text-zinc-500 text-sm">Vui lòng chờ trong giây lát</p>
                  </div>
                ) : (
                  <div className="text-center space-y-5">
                    <div className="text-6xl">👥</div>
                    <div className="space-y-2">
                      <p className="text-zinc-300 text-xl font-bold">Sẵn sàng chat?</p>
                      <p className="text-zinc-500 text-sm">Nhấn Start để gặp người lạ ngay</p>
                    </div>
                    <button
                      id="start-btn"
                      onClick={handleStart}
                      className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-base rounded-full shadow-xl shadow-rose-500/40 hover:shadow-rose-500/60 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      🚀 Bắt Đầu Ngay
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

            {/* Local Camera (PiP) */}
            <div className="absolute bottom-20 right-3 sm:right-4 w-28 sm:w-36 aspect-video bg-zinc-800 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-xl shadow-black/50 group">
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/80 to-violet-900/80 flex items-center justify-center">
                <span className="text-2xl">🤳</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-medium transition-opacity duration-200">
                  You
                </span>
              </div>
            </div>

            {/* Floating Toolbar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-max backdrop-blur-lg bg-black/50 border border-white/10 rounded-full px-4 py-2.5 shadow-2xl shadow-black/50">
              <VideoToolbar onNext={handleNext} />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Chat Area (30%) ── */}
        <div className="h-64 lg:h-auto lg:flex-[3] min-h-0">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
