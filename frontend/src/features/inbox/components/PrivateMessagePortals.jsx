import React from 'react';
import { createPortal } from 'react-dom';
import { Copy, Reply, Trash2 } from 'lucide-react';

export default function PrivateMessagePortals({
  msg,
  t,
  isReactionOpen,
  isMenuOpen,
  reactionPos,
  menuPos,
  handleReact,
  handleCopy,
  handleUnsend,
  setReplyingTo,
  setActiveMenuId
}) {
  return (
    <>
      {isReactionOpen && createPortal(
        <div
          className="fixed z-[9999] flex gap-2 bg-[#2d2d30]/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-white/10 animate-slide-up"
          style={{
            bottom: `calc(100vh - ${reactionPos.top}px)`,
            ...(msg.isMine ? { right: `calc(100vw - ${reactionPos.left}px)` } : { left: `${reactionPos.left}px` }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
            <button
              key={emoji}
              onClick={(ev) => { ev.stopPropagation(); handleReact(msg.id, emoji); }}
              className="hover:scale-125 transition-transform origin-bottom text-lg leading-none"
            >
              {emoji}
            </button>
          ))}
        </div>,
        document.body
      )}

      {isMenuOpen && createPortal(
        <div
          className="fixed z-[9999] w-max bg-neutral-800 border border-neutral-700 rounded-xl shadow-2xl animate-slide-up"
          style={{
            bottom: `calc(100vh - ${menuPos.top}px)`,
            ...(menuPos.alignRight ? { right: `calc(100vw - ${menuPos.left}px)` } : { left: `${menuPos.left}px` }),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {msg.type !== 'VOICE' && msg.type !== 'IMAGE' && (
            <button
              onClick={() => handleCopy(msg.text)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors rounded-t-xl"
            >
              <Copy className="w-3.5 h-3.5" /> {t.COPY}
            </button>
          )}
          <button
            onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors ${msg.type === 'VOICE' || msg.type === 'IMAGE' ? 'rounded-t-xl' : ''}`}
          >
            <Reply className="w-3.5 h-3.5" /> {t.REPLY}
          </button>
          {msg.isMine && (
            <button
              onClick={() => handleUnsend(msg.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors rounded-b-xl"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.UNSEND}
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
