import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import ReportModal from '../../components/common/ReportModal';
import SystemMessage from './SystemMessage';
import PrivateMessageRow from './PrivateMessageRow';
import PrivateChatHeader from './PrivateChatHeader';
import PrivateChatInput from './PrivateChatInput';
import axiosClient from '../../api/axiosClient';

export default function PrivateChatModal({ isOpen, onClose, friend }) {
  const { lang, removeFriend, setInboxOpen } = useStore();
  const t = translations[lang];
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReactionId, setActiveReactionId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    setShowReportModal(false);
  }, [friend]);

  useEffect(() => {
    if (isOpen && friend) {
      axiosClient.get('/api/v1/messages', {
        params: { friendshipId: friend.friendshipId }
      }).then(response => {
        const data = response?.data || response;
        const mappedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.content,
          isMine: msg.senderId === useStore.getState().userInfo?.id,
          reaction: msg.reaction,
          replyTo: msg.replyToId ? { id: msg.replyToId } : null,
          type: msg.type
        }));
        setMessages(mappedMessages);
      }).catch(err => {
        console.error("Lỗi fetch private messages:", err);
      });
    }
  }, [isOpen, friend]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !friend) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    
    try {
      const payload = {
        friendshipId: friend.friendshipId,
        content: text.trim(),
        type: 'TEXT',
        replyToId: replyingTo?.id || null
      };

      const response = await axiosClient.post('/api/v1/messages', payload);
      const newMsg = response?.data || response;

      setMessages(prev => [...prev, {
        id: newMsg.id,
        text: newMsg.content,
        isMine: true,
        replyTo: replyingTo,
        reaction: null,
        type: 'TEXT'
      }]);

      setText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending private message:', error);
    }
  };

  const handleUnsend = async (id) => {
    try {
      await axiosClient.delete(`/api/v1/messages/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error unsending message:', error);
    }
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
    <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 w-full sm:w-[450px] h-[100dvh] sm:h-[500px] bg-[#141414] sm:rounded-3xl shadow-2xl border-t sm:border border-neutral-800 flex flex-col z-[200] animate-slide-up">
      <PrivateChatHeader 
        friend={friend} 
        onClose={onClose} 
        setShowReportModal={setShowReportModal} 
      />

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

      <PrivateChatInput 
        text={text}
        setText={setText}
        handleSend={handleSend}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        friend={friend}
        setMessages={setMessages}
      />

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        reportedUserId={friend?.id}
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
