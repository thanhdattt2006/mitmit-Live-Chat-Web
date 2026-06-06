import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import useStore from '../../store/useStore';
import { translations } from '../../utils/translation';
import ReportModal from '../../components/common/ReportModal';
import SystemMessage from './SystemMessage';
import PrivateMessageRow from './PrivateMessageRow';
import PrivateChatHeader from './PrivateChatHeader';
import PrivateChatInput from './PrivateChatInput';
import axiosClient from '../../api/axiosClient';

export default function PrivateChatModal({ isOpen, onClose, friend }) {
  const { lang, removeFriend, setInboxOpen, userInfo } = useStore();
  const t = translations[lang];
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReactionId, setActiveReactionId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    setShowReportModal(false);
  }, [friend]);

  useEffect(() => {
    if (isOpen && friend) {
      axiosClient.get('/api/v1/messages/' + friend.friendshipId)
      .then(response => {
        const data = response?.data || response;
        const msgList = Array.isArray(data) ? data : (data?.content || []);
        const mappedMessages = msgList.map(msg => {
          const msgType = msg.type ? msg.type.toUpperCase() : 'TEXT';
          let replyToObj = null;
          if (msg.replyToId) {
             const parent = msgList.find(m => m.id === msg.replyToId);
             if (parent) {
                const parentType = parent.type ? parent.type.toUpperCase() : 'TEXT';
                replyToObj = {
                   id: parent.id,
                   type: parentType,
                   text: parentType === 'TEXT' ? parent.content : (parentType === 'IMAGE' ? 'Image' : 'Voice'),
                   isMine: parent.senderId === userInfo?.id
                };
             }
          }
          return {
            id: msg.id,
            text: msgType === 'TEXT' ? msg.content : undefined,
            imageUrl: msgType === 'IMAGE' ? msg.content : undefined,
            audioUrl: msgType === 'VOICE' ? msg.content : undefined,
            isMine: msg.senderId === userInfo?.id,
            reaction: msg.reaction,
            replyTo: replyToObj,
            type: msgType
          };
        });
        setMessages(mappedMessages);
      }).catch(err => {
        console.error("Lỗi fetch private messages:", err);
      });

      const socketUrl = 'http://localhost:8080/ws';
      const token = localStorage.getItem('mitmit_jwt_token');
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          stompClientRef.current = stompClient;
          stompClient.subscribe(`/user/${userInfo?.id}/queue/messages`, (msg) => {
            try {
              const newMsg = JSON.parse(msg.body);
              if (newMsg.friendshipId === friend.friendshipId) {
                setMessages(prev => {
                  // Cập nhật reaction nếu tin nhắn đã tồn tại
                  if (prev.some(m => m.id === newMsg.id)) {
                    return prev.map(m => m.id === newMsg.id ? { ...m, reaction: newMsg.reaction } : m);
                  }
                  
                  let replyToObj = null;
                  if (newMsg.replyToId) {
                     const parent = prev.find(m => m.id === newMsg.replyToId);
                     if (parent) {
                        replyToObj = {
                           id: parent.id,
                           type: parent.type,
                           text: parent.text || 'Media',
                           isMine: parent.isMine
                        };
                     }
                  }
                  return [...prev, {
                    id: newMsg.id,
                    text: newMsg.type === 'TEXT' ? newMsg.content : undefined,
                    imageUrl: newMsg.type === 'IMAGE' ? newMsg.content : undefined,
                    audioUrl: newMsg.type === 'VOICE' ? newMsg.content : undefined,
                    isMine: newMsg.senderId === userInfo?.id,
                    reaction: newMsg.reaction,
                    replyTo: replyToObj,
                    type: newMsg.type
                  }];
                });
              }
            } catch (err) {
              console.error('Lỗi parse real-time message:', err);
            }
          });
        }
      });
      stompClient.activate();

      return () => {
        stompClient.deactivate();
      };
    }
  }, [isOpen, friend, userInfo?.id]);

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
        replyToId: replyingTo?.id || null,
        senderId: useStore.getState().userInfo?.id,
        isUnsent: false
      };

      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({ destination: '/app/chat.private', body: JSON.stringify(payload) });
      } else {
        console.warn("STOMP connection not ready, message not sent");
      }

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
  
  const handleReact = async (id, emoji) => {
    // Optimistic UI update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, reaction: emoji } : m));
    setActiveReactionId(null);
    try {
      await axiosClient.put(`/api/v1/messages/${id}/reaction?reaction=${encodeURIComponent(emoji)}`);
    } catch (error) {
      console.error('Error reacting to message:', error);
    }
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
        stompClientRef={stompClientRef}
      />

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        reportedUserId={friend?.id}
        isFromInbox={true}
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
