import React, { useState, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function ChatInput() {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { addMessage, lang, isMatching } = useStore();
  const t = translations[lang];

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isMatching) return;
    
    addMessage({ id: Date.now().toString(), type: 'user', text: text.trim(), isMine: true });
    setText('');
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
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#141414]">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
        <div className="flex-1 relative flex items-center">
          <textarea 
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isMatching}
            rows={1} 
            className="w-full bg-gray-100 dark:bg-neutral-900 border border-transparent focus:border-gray-300 dark:focus:border-neutral-700 rounded-2xl py-3 pl-4 pr-10 text-sm outline-none resize-none overflow-hidden transition-colors disabled:opacity-50 text-neutral-900 dark:text-white placeholder:text-gray-400" 
            placeholder={t.CHAT_PLACEHOLDER}
          />
          <button type="button" className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button 
          type="submit" 
          disabled={!text.trim() || isMatching}
          className="h-[46px] w-[46px] flex-shrink-0 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100"
        >
          <Send className="w-5 h-5 ml-0.5 fill-current" />
        </button>
      </form>
    </div>
  );
}
