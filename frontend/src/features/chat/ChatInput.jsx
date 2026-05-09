import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);
  
  const { addMessage, lang, isMatching } = useStore();
  const t = translations[lang];

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isMatching) return;
    
    try {
      addMessage({ id: Date.now().toString(), type: 'user', text: text.trim(), isMine: true });
      setText('');
      setShowEmojiPicker(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }

      setTimeout(() => {
        const mockReplies = [
          "Haha that's funny.",
          "Wow really? Tell me more.",
          "Nice to meet you! I'm enjoying this app.",
          "I'm listening..."
        ];
        addMessage({
          id: Date.now().toString(),
          type: 'user',
          text: mockReplies[Math.floor(Math.random() * mockReplies.length)],
          isMine: false
        });
      }, 1500 + Math.random() * 1500);
    } catch (error) {
      console.error('Error handling chat submission:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#141414] relative">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-[80px] right-4 z-[60] shadow-2xl rounded-2xl overflow-hidden animate-slide-up border border-neutral-800 scale-90 origin-bottom-right">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme="dark" 
            autoFocusSearch={false}
            width={300}
            height={350}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 relative z-10">
        <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-neutral-900 rounded-2xl border border-transparent focus-within:border-gray-300 dark:focus-within:border-neutral-700 transition-colors">
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isMatching}
            rows={1} 
            className="w-full bg-transparent py-3 pl-4 pr-10 text-sm outline-none resize-none overflow-hidden disabled:opacity-50 text-neutral-900 dark:text-white placeholder:text-gray-400" 
            placeholder={t.CHAT_PLACEHOLDER}
          />
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button 
          type="submit" 
          disabled={!text.trim() || isMatching}
          className="h-[46px] w-[46px] flex-shrink-0 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100 shadow-sm"
        >
          <Send className="w-5 h-5 ml-0.5 fill-current" />
        </button>
      </form>
    </div>
  );
}
