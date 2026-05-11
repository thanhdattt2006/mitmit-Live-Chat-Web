import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Mic, Play, MoreHorizontal, AlertTriangle, UserMinus, Copy, Reply, Trash2, MoreVertical, Image as ImageIcon } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import EmojiPicker from 'emoji-picker-react';
import ReportModal from '../../components/common/ReportModal';
import SystemMessage from './SystemMessage';
import PrivateMessageRow from './PrivateMessageRow';

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
  const fileInputRef = useRef(null);

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReactionId, setActiveReactionId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

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
          isMine: true,
          replyTo: replyingTo
        }]);
        setReplyingTo(null);

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
    setShowMoreMenu(false);
    setShowUnfriendConfirm(false);
    setShowReportModal(false);
  }, [friend]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: '1', type: 'system', text: friend?.lastMsg || t.MOCK_REPLIES[0], isMine: false }
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
      setMessages(prev => [...prev, { id: Date.now().toString(), text: text.trim(), isMine: true, replyTo: replyingTo }]);
      setText('');
      setReplyingTo(null);
      
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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        type: 'image', 
        imageUrl: imageUrl, 
        isMine: true,
        replyTo: replyingTo 
      }]);
      setReplyingTo(null);
      e.target.value = ''; // Reset input
    }
  };

  const handleUnsend = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setActiveMenuId(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setActiveMenuId(null);
    setToastMsg(t.COPY_SUCCESS);
    setTimeout(() => setToastMsg(''), 2000);
  };
  
  const handleReact = (id, emoji) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, reaction: emoji } : m));
    setActiveReactionId(null);
  };

  return (
    <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[450px] h-[100dvh] sm:h-[500px] bg-[#141414] sm:rounded-3xl shadow-2xl border-t sm:border border-neutral-800 flex flex-col z-[100] animate-slide-up overflow-visible">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md sm:rounded-t-3xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-full object-cover border border-neutral-700" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#141414]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{friend.name}</h3>
              <span className="px-1.5 py-0.5 bg-neutral-800 rounded-full text-[10px] text-gray-300 border border-neutral-700 flex items-center gap-1 shrink-0">
                {friend.age || 21} <span className={`font-bold ${friend.gender === 'female' ? 'text-pink-400' : friend.gender === 'male' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {friend.gender === 'female' ? '♀' : friend.gender === 'male' ? '♂' : '⚥'}
                </span>
              </span>
            </div>
            <p className="text-[10px] text-green-400">{t.PRIVATE_CHAT}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1.5 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-[999] animate-slide-up origin-top-right">
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
                        {t.OK}
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

      {/* Messages — overflow-y-auto only; NO overflow:hidden to avoid clipping popups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 flex flex-col gap-3 scroll-smooth" onClick={() => { setActiveMenuId(null); setActiveReactionId(null); }}>
        {messages?.map((msg) => {
          if (msg.type === 'system') {
            return <SystemMessage key={msg.id} text={msg.text} />;
          }

          return (
            <PrivateMessageRow 
              key={msg.id}
              msg={msg}
              friend={friend}
              t={t}
              activeMenuId={activeMenuId}
              setActiveMenuId={setActiveMenuId}
              activeReactionId={activeReactionId}
              setActiveReactionId={setActiveReactionId}
              handleCopy={handleCopy}
              handleReact={handleReact}
              handleUnsend={handleUnsend}
              setReplyingTo={setReplyingTo}
            />
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2.5 border-t border-neutral-800 bg-neutral-900/50 rounded-b-3xl flex flex-col">
        {replyingTo && (
          <div className="flex items-center justify-between bg-neutral-800/80 backdrop-blur-sm border-l-2 border-blue-500 p-2 mb-2 rounded-r-lg shadow-sm animate-fade-in">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[10px] font-semibold text-blue-400 mb-0.5">{t.REPLYING_TO} {replyingTo.isMine ? t.YOU : friend.name}</p>
              <p className="text-xs text-gray-300 truncate">{replyingTo.type === 'voice' ? t.VOICE_MESSAGE : replyingTo.text}</p>
            </div>
            <button type="button" onClick={() => setReplyingTo(null)} className="p-1 text-gray-500 hover:text-white rounded-full transition-colors shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-1.5 relative">
          {/* Left: Image Action */}
          <div className="shrink-0 mb-0.5">
            <button 
              type="button" 
              onClick={handleImageClick}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-all active:scale-90"
              title="Send Image"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/gif, image/webp" 
              className="hidden" 
            />
          </div>

          {/* Center: Input Area */}
          <div className="flex-1 relative bg-neutral-800/60 border border-neutral-700/30 focus-within:border-blue-500/40 rounded-2xl transition-all duration-200">
            <textarea 
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              ref={textareaRef}
              rows={1}
              maxLength={500}
              style={{ maxHeight: '100px', scrollbarWidth: 'none' }}
              className="w-full bg-transparent py-2 pl-3 pr-9 text-sm outline-none resize-none overflow-y-auto text-white placeholder-gray-500 [&::-webkit-scrollbar]:hidden leading-relaxed" 
              placeholder={t.CHAT_PLACEHOLDER}
            />
            
            <div ref={emojiRef} className="absolute right-1.5 bottom-1.5 z-10">
              <button 
                type="button" 
                onClick={() => setShowEmoji((prev) => !prev)}
                className={`p-1 rounded-full transition-all active:scale-90 ${showEmoji ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'}`}
              >
                <Smile className="w-5 h-5" />
              </button>
              
              {showEmoji && (
                <div className="absolute bottom-full right-0 mb-3 z-50 scale-90 origin-bottom-right">
                  <EmojiPicker 
                    onEmojiClick={handleEmojiClick}
                    theme="dark"
                    width={280}
                    height={320}
                    lazyLoadEmojis={true}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Send/Voice Action */}
          <div className="shrink-0">
            {text.trim() ? (
              <button 
                type="submit" 
                className="w-9 h-9 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-sm"
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
                className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center transition-all shadow-sm ${isRecording ? 'bg-red-500 animate-pulse text-white scale-110' : 'bg-neutral-800 text-gray-400 hover:text-white hover:bg-neutral-700 active:scale-95'}`}
              >
                <Mic className="w-4.5 h-4.5 fill-current" />
              </button>
            )}
          </div>
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

      {toastMsg && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-4 py-2 rounded-full shadow-xl animate-fade-in z-[110]">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
