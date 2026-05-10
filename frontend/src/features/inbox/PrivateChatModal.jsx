import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import EmojiPicker from 'emoji-picker-react';

export default function PrivateChatModal({ isOpen, onClose, friend }) {
  const { lang } = useStore();
  const t = translations[lang];
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const textareaRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: '1', text: friend?.lastMsg || 'Hello!', isMine: false }
      ]);
    }
  }, [isOpen, friend, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !friend) return null;

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    
    try {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: text.trim(), isMine: true }]);
      setText('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Haha, okay!', isMine: false }]);
      }, 1500);
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-[350px] h-[450px] bg-[#141414] rounded-3xl shadow-2xl border border-neutral-800 flex flex-col overflow-hidden z-[100] animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#141414]"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{friend.name}</h3>
            <p className="text-[10px] text-green-400">{t.PRIVATE_CHAT}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-slide-up ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-full px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap [overflow-wrap:anywhere] ${
              msg.isMine 
              ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
              : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900/50">
        <form onSubmit={handleSend} className="flex items-end gap-2 relative">
          <div className="flex-1 relative flex items-center bg-neutral-800 border border-transparent focus-within:border-neutral-700 rounded-2xl transition-colors">
            <textarea 
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              ref={textareaRef}
              rows={1}
              style={{ maxHeight: '80px', scrollbarWidth: 'none' }}
              className="w-full bg-transparent py-2.5 pl-4 pr-10 text-sm outline-none resize-none overflow-y-auto text-white placeholder-gray-500 [&::-webkit-scrollbar]:hidden" 
              placeholder={t.CHAT_PLACEHOLDER}
            />
            <div ref={emojiRef}>
              <button 
                type="button" 
                onClick={() => setShowEmoji((prev) => !prev)}
                className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-200 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-2 z-50 scale-90 origin-bottom-right">
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    width={300}
                    height={350}
                  />
                </div>
              )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!text.trim()}
            className="w-[38px] h-[38px] flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4 ml-0.5 fill-current" />
          </button>
        </form>
      </div>
    </div>
  );
}
