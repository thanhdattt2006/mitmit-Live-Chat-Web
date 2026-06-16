import React, { useRef, useState, useEffect } from 'react';
import { Send, Smile, Mic, X, Image as ImageIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import toast from 'react-hot-toast';
import useVoiceRecord from './hooks/useVoiceRecord';
import useOptimisticUpload from './hooks/useOptimisticUpload';

export default function PrivateChatInput({ text, setText, handleSend, replyingTo, setReplyingTo, friend, stompClientRef }) {
  const { lang } = useStore();
  const t = translations[lang];

  const [showEmoji, setShowEmoji] = useState(false);
  
  const textareaRef = useRef(null);
  const emojiRef = useRef(null);
  const fileInputRef = useRef(null);

  const { uploadMedia } = useOptimisticUpload(friend, replyingTo, setReplyingTo, stompClientRef);

  const handleVoiceComplete = (audioBlob) => {
    uploadMedia(audioBlob, 'VOICE');
  };

  const { isRecording, startRecording, stopRecording } = useVoiceRecord(handleVoiceComplete);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmoji(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t.ERROR_IMAGE_SIZE);
        e.target.value = '';
        return;
      }
      uploadMedia(file, 'IMAGE');
      e.target.value = '';
    }
  };

  return (
    <div className="px-3 py-2.5 border-t border-neutral-800 bg-neutral-900/50 rounded-b-3xl flex flex-col">
      {replyingTo && (
        <div className="flex items-center justify-between bg-neutral-800/80 backdrop-blur-sm border-l-2 border-blue-500 p-2 mb-2 rounded-r-lg shadow-sm animate-fade-in">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] font-semibold text-blue-400 mb-0.5">{t.REPLYING_TO} {replyingTo.isMine ? t.YOU : friend.name}</p>
            <p className="text-xs text-gray-300 truncate">{replyingTo.type === 'VOICE' ? t.VOICE_MESSAGE : replyingTo.type === 'IMAGE' ? t.IMAGE || 'Image' : replyingTo.text}</p>
          </div>
          <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-gray-500 hover:text-white rounded-full transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <form onSubmit={handleSend} className="flex items-center gap-2 relative">
        <div className="shrink-0 w-9 h-9 flex items-center justify-center">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all active:scale-90">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>

        <div className="flex-1 flex items-center bg-neutral-800/60 border border-neutral-700/30 focus-within:border-blue-500/40 rounded-2xl transition-all duration-200 min-h-[40px] px-1">
          <textarea 
            value={text} onChange={handleInput} onKeyDown={handleKeyDown} ref={textareaRef} rows={1} maxLength={500} style={{ maxHeight: '100px', scrollbarWidth: 'none' }}
            className="flex-1 bg-transparent py-2 pl-2 pr-2 text-sm outline-none resize-none overflow-y-auto text-white placeholder-gray-500 [&::-webkit-scrollbar]:hidden leading-relaxed block" 
            placeholder={t.CHAT_PLACEHOLDER}
          />
          <div ref={emojiRef} className="relative shrink-0 mr-1">
            <button type="button" onClick={() => setShowEmoji(p => !p)} className={`p-1.5 rounded-full transition-all active:scale-90 ${showEmoji ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'}`}>
              <Smile className="w-5 h-5" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-full right-0 mb-3 z-50 scale-90 origin-bottom-right">
                <EmojiPicker onEmojiClick={(d) => setText(p => p + d.emoji)} theme="dark" width={280} height={320} lazyLoadEmojis={true} />
              </div>
            )}
          </div>
        </div>
        
        <div className="shrink-0 w-9 h-9 flex items-center justify-center">
          {text.trim() ? (
            <button type="submit" className="w-full h-full bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-sm">
              <Send className="w-4 h-4 ml-0.5 fill-current" />
            </button>
          ) : (
            <button type="button" onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
              className={`w-full h-full rounded-full flex items-center justify-center transition-all shadow-sm ${isRecording ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-neutral-800 text-gray-400 hover:text-white hover:bg-neutral-700 active:scale-95'}`}
            >
              <Mic className="w-4.5 h-4.5 fill-current" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
