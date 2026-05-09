import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';

export default function PrivateChatModal({ isOpen, onClose, friend }) {
  const { lang } = useStore();
  const t = translations[lang];
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

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
    e.preventDefault();
    if (!text.trim()) return;
    
    setMessages([...messages, { id: Date.now().toString(), text, isMine: true }]);
    setText('');
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Haha, okay!', isMine: false }]);
    }, 1500);
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
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-slide-up ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words ${
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
          <div className="flex-1 relative flex items-center">
            <input 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-neutral-800 border border-transparent focus:border-neutral-700 rounded-full py-2.5 pl-4 pr-10 text-sm outline-none transition-colors text-white placeholder-gray-500" 
              placeholder={t.CHAT_PLACEHOLDER}
            />
            <button type="button" className="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
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
