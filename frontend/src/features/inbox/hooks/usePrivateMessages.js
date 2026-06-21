import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axiosClient from '../../../api/axiosClient';
import useStore from '../../../store/useStore';

export default function usePrivateMessages(friend, isOpen) {
  const { userInfo, setMessages } = useStore();
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (isOpen && friend) {
      axiosClient.get('/api/v1/messages/' + friend.friendshipId)
      .then(response => {
        const data = response?.data || response;
        const msgList = Array.isArray(data) ? data : (data?.content || []);
        const sortedMsgList = [...msgList].reverse();
        const mappedMessages = sortedMsgList.map(msg => {
          const msgType = msg.type ? msg.type.toUpperCase() : 'TEXT';
          let replyToObj = null;
          if (msg.replyToId) {
             const parent = sortedMsgList.find(m => m.id === msg.replyToId);
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
            reactions: msg.reactions || {},
            replyTo: replyToObj,
            type: msgType
          };
        });
        setMessages(mappedMessages);
      }).catch(err => console.error("Lỗi fetch private messages:", err));

      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const socketUrl = `${apiUrl}/ws`;
      const token = localStorage.getItem('mitmit_jwt_token');
      const stompClient = new Client({
        webSocketFactory: () => new SockJS(socketUrl),
        connectHeaders: { Authorization: `Bearer ${token}` },
        onConnect: () => {
          stompClientRef.current = stompClient;
          stompClient.subscribe(`/queue/chat-${userInfo?.id}`, (msg) => {
            try {
              const newMsg = JSON.parse(msg.body);
              if (newMsg.friendshipId === friend.friendshipId) {
                setMessages(prev => {
                  if (prev.some(m => m.id === newMsg.id)) {
                    return prev.map(m => m.id === newMsg.id ? { 
                      ...m, 
                      reactions: newMsg.reactions || m.reactions || {}
                    } : m);
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
                    reactions: newMsg.reactions || {},
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

      return () => stompClient.deactivate();
    }
  }, [isOpen, friend, userInfo?.id, setMessages]);

  return { stompClientRef };
}
