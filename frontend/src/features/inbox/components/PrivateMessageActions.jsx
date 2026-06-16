import React from 'react';
import { Smile, MoreVertical } from 'lucide-react';

export default function PrivateMessageActions({
  msg,
  isMenuOpen,
  isReactionOpen,
  reactionBtnRef,
  menuBtnRef,
  setActiveReactionId,
  setActiveMenuId
}) {
  return (
    <div
      className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${isMenuOpen || isReactionOpen ? '!opacity-100' : ''}`}
    >
      <button
        ref={reactionBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveReactionId(isReactionOpen ? null : msg.id);
          setActiveMenuId(null);
        }}
        className="p-1.5 text-gray-500 hover:text-gray-300 rounded-full hover:bg-neutral-800 transition-colors"
        title="React"
      >
        <Smile className="w-4 h-4" />
      </button>

      <button
        ref={menuBtnRef}
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenuId(isMenuOpen ? null : msg.id);
          setActiveReactionId(null);
        }}
        className="p-1.5 text-gray-500 hover:text-gray-300 rounded-full hover:bg-neutral-800 transition-colors"
        title="More"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
