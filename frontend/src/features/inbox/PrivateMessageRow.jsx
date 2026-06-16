import React, { useRef, useEffect, useState } from 'react';
import PrivateMessagePortals from './components/PrivateMessagePortals';
import PrivateMessageActions from './components/PrivateMessageActions';
import PrivateMessageBubble from './components/PrivateMessageBubble';

export default function PrivateMessageRow({
  msg,
  friend,
  t,
  activeMenuId,
  setActiveMenuId,
  activeReactionId,
  setActiveReactionId,
  handleCopy,
  handleReact,
  handleUnsend,
  setReplyingTo,
  onViewImage,
}) {
  const isMenuOpen = activeMenuId === msg.id;
  const isReactionOpen = activeReactionId === msg.id;

  const reactionBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const [reactionPos, setReactionPos] = useState({ top: 0, left: 0 });
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, alignRight: false });

  useEffect(() => {
    if (isReactionOpen && reactionBtnRef.current) {
      const rect = reactionBtnRef.current.getBoundingClientRect();
      setReactionPos({
        top: rect.top + window.scrollY - 8,
        left: msg.isMine ? rect.right : rect.left,
      });
    }
  }, [isReactionOpen, msg.isMine]);

  useEffect(() => {
    if (isMenuOpen && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.top + window.scrollY - 8,
        left: msg.isMine ? rect.right : rect.left,
        alignRight: msg.isMine,
      });
    }
  }, [isMenuOpen, msg.isMine]);

  return (
    <>
      <PrivateMessagePortals
        msg={msg}
        t={t}
        isReactionOpen={isReactionOpen}
        isMenuOpen={isMenuOpen}
        reactionPos={reactionPos}
        menuPos={menuPos}
        handleReact={handleReact}
        handleCopy={handleCopy}
        handleUnsend={handleUnsend}
        setReplyingTo={setReplyingTo}
        setActiveMenuId={setActiveMenuId}
      />

      <div className={`group relative flex items-end gap-2 w-full animate-slide-up ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
        {msg.isMine && (
          <PrivateMessageActions
            msg={msg}
            isMenuOpen={isMenuOpen}
            isReactionOpen={isReactionOpen}
            reactionBtnRef={reactionBtnRef}
            menuBtnRef={menuBtnRef}
            setActiveReactionId={setActiveReactionId}
            setActiveMenuId={setActiveMenuId}
          />
        )}

        <PrivateMessageBubble 
          msg={msg} 
          friend={friend} 
          t={t} 
          onViewImage={onViewImage} 
        />

        {!msg.isMine && (
          <PrivateMessageActions
            msg={msg}
            isMenuOpen={isMenuOpen}
            isReactionOpen={isReactionOpen}
            reactionBtnRef={reactionBtnRef}
            menuBtnRef={menuBtnRef}
            setActiveReactionId={setActiveReactionId}
            setActiveMenuId={setActiveMenuId}
          />
        )}
      </div>
    </>
  );
}
