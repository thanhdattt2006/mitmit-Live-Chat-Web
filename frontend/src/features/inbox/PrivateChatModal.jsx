import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Mic, Play, MoreHorizontal, AlertTriangle, UserMinus } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import EmojiPicker from 'emoji-picker-react';
import ReportModal from '../../components/common/ReportModal';

export default function PrivateChatModal({ isOpen, onClose, friend }) {
  const { lang, removeFriend, setInboxOpen } = useStore();
  const t = translations[lang];
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);
  const emojiRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Voice message blob:', audioBlob);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          type: 'voice', 
          audioUrl: audioUrl,
          isMine: true 
        }]);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
        setShowUnfriendConfirm(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: '1', text: friend?.lastMsg || t.MOCK_REPLIES[0], isMine: false }
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
        setMessages(prev => [...prev, { id: Date.now().toString(), text: t.MOCK_REPLIES[4] || t.MOCK_REPLIES[0], isMine: false }]);
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
        <div className="flex items-center gap-1">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up origin-top-right">
                {!showUnfriendConfirm ? (
                  <div className="p-1">
                    <button 
                      onClick={() => { setShowReportModal(true); setShowMoreMenu(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      {t.REPORT_USER}
                    </button>
                    <button 
                      onClick={() => setShowUnfriendConfirm(true)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <UserMinus className="w-4 h-4" />
                      {t.UNFRIEND}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-xs text-gray-300 mb-3 leading-relaxed">{t.UNFRIEND_CONFIRM}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowUnfriendConfirm(false)}
                        className="flex-1 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        {t.CANCEL}
                      </button>
                      <button 
                        onClick={() => { 
                          removeFriend(friend.id); 
                          onClose(); 
                          setInboxOpen(false);
                        }}
                        className="flex-1 py-1.5 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scroll-smooth">
        {messages?.map((msg) => (
          <div key={msg.id} className={`flex w-full animate-slide-up ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3.5 py-2 text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap [overflow-wrap:anywhere] ${
              msg.isMine 
              ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
              : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700'
            }`}>
              {msg.type === 'voice' ? (
                <div className="flex items-center gap-2 w-48">
                  <button onClick={() => {
                    const audio = new Audio(msg.audioUrl);
                    audio.play();
                  }} className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${msg.isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-neutral-700 hover:bg-neutral-600'}`}>
                     <Play className="w-4 h-4 fill-current" />
                  </button>
                  <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${msg.isMine ? 'bg-white/30' : 'bg-neutral-700'}`}>
                    <div className={`w-1/3 h-full rounded-full animate-pulse ${msg.isMine ? 'bg-white' : 'bg-blue-500'}`}></div>
                  </div>
                  <span className="text-[10px] opacity-70">0:00</span>
                </div>
              ) : (
                msg.text
              )}
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
              maxLength={500}
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
          {text.trim() ? (
            <button 
              type="submit" 
              className="w-[38px] h-[38px] flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5 fill-current" />
            </button>
          ) : (
            <button 
              type="button" 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-[38px] h-[38px] flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${isRecording ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-neutral-800 text-gray-400 hover:text-white hover:bg-neutral-700 active:scale-95'}`}
            >
              <Mic className="w-4 h-4 fill-current" />
            </button>
          )}
        </form>
      </div>

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        onReportSuccess={() => {
          removeFriend(friend.id);
          onClose();
          setInboxOpen(false);
        }}
      />
    </div>
  );
}
