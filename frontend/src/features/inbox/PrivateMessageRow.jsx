import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Smile, MoreVertical, Copy, Reply, Trash2 } from 'lucide-react';
import VoicePlayer from '../../components/common/VoicePlayer';

/**
 * @param {object} props
 * @param {{ id: string, type: string, text?: string, audioUrl?: string, imageUrl?: string, isMine: boolean, reaction?: string, replyTo?: object }} props.msg
 * @param {{ name: string, avatar: string }} props.friend
 * @param {object} props.t - i18n translations
 * @param {string|null} props.activeMenuId
 * @param {function} props.setActiveMenuId
 * @param {string|null} props.activeReactionId
 * @param {function} props.setActiveReactionId
 * @param {function} props.handleCopy
 * @param {function} props.handleReact
 * @param {function} props.handleUnsend
 * @param {function} props.setReplyingTo
 */
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
}) {
  const isMenuOpen = activeMenuId === msg.id;
  const isReactionOpen = activeReactionId === msg.id;

  // Refs for portal positioning
  const reactionBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const [reactionPos, setReactionPos] = useState({ top: 0, left: 0 });
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, alignRight: false });

  /**
   * Compute viewport position for the reaction picker portal.
   * Positions the picker ABOVE the trigger button (bottom-full equivalent).
   */
  useEffect(() => {
    if (isReactionOpen && reactionBtnRef.current) {
      const rect = reactionBtnRef.current.getBoundingClientRect();
      setReactionPos({
        // Place picker so its bottom edge is 8px above the button's top edge
        top: rect.top + window.scrollY - 8,
        left: msg.isMine ? rect.right : rect.left,
      });
    }
  }, [isReactionOpen, msg.isMine]);

  /**
   * Compute viewport position for the dropdown menu portal.
   * Positions the menu ABOVE the trigger button.
   */
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

  /** Reaction picker rendered via portal to escape overflow clip */
  const ReactionPickerPortal = () => {
    if (!isReactionOpen) return null;
    return createPortal(
      <div
        className="fixed z-[9999] flex gap-2 bg-[#2d2d30]/95 backdrop-blur-md px-3 py-1.5
          rounded-full shadow-2xl border border-white/10 animate-slide-up"
        style={{
          bottom: `calc(100vh - ${reactionPos.top}px)`,
          ...(msg.isMine
            ? { right: `calc(100vw - ${reactionPos.left}px)` }
            : { left: `${reactionPos.left}px` }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
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
    );
  };

  /** More-actions dropdown rendered via portal to escape overflow clip */
  const MenuPortal = () => {
    if (!isMenuOpen) return null;
    return createPortal(
      <div
        className="fixed z-[9999] w-max bg-neutral-800 border border-neutral-700
          rounded-xl shadow-2xl animate-slide-up"
        style={{
          bottom: `calc(100vh - ${menuPos.top}px)`,
          ...(menuPos.alignRight
            ? { right: `calc(100vw - ${menuPos.left}px)` }
            : { left: `${menuPos.left}px` }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {msg.type !== 'voice' && msg.type !== 'image' && (
          <button
            onClick={() => handleCopy(msg.text)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors rounded-t-xl"
          >
            <Copy className="w-3.5 h-3.5" /> {t.COPY}
          </button>
        )}
        <button
          onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors
            ${msg.type === 'voice' || msg.type === 'image' ? 'rounded-t-xl' : ''}`}
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
    );
  };

  /** The 😊 + ⋮ action cluster, shown on row-hover or when popup is open */
  const Actions = () => (
    <div
      className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200
        opacity-0 group-hover:opacity-100
        ${isMenuOpen || isReactionOpen ? '!opacity-100' : ''}`}
    >
      {/* Reaction trigger */}
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

      {/* More-actions trigger */}
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

  return (
    <>
      {/* Portals render outside scroll container — no clipping possible */}
      <ReactionPickerPortal />
      <MenuPortal />

      <div
        className={`group relative flex items-end gap-2 w-full animate-slide-up
          ${msg.isMine ? 'justify-end' : 'justify-start'}`}
      >
        {/* ── Actions LEFT of bubble (my messages) ── */}
        {msg.isMine && <Actions />}

        {/* ── Chat Bubble ── */}
        <div
          className={`relative max-w-[75%] text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap
            ${msg.type === 'image'
              ? ''
              : msg.isMine
                ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2'
                : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700 px-3.5 py-2'
            }
            ${msg.type === 'voice' ? 'p-0 overflow-hidden' : ''}`}
        >
          {/* Replied-to quote */}
          {msg.replyTo && (
            <div
              className={`mb-1.5 pl-2 border-l-2 text-xs opacity-80
                ${msg.isMine ? 'border-white/50 text-white' : 'border-gray-500 text-gray-300'}`}
            >
              <p className="font-semibold text-[10px] mb-0.5">
                {msg.replyTo.isMine ? t.YOU : friend.name}
              </p>
              <p className="truncate">
                {msg.replyTo.type === 'voice' ? t.VOICE_MESSAGE : msg.replyTo.text}
              </p>
            </div>
          )}

          {/* Message content */}
          {msg.type === 'voice' ? (
            <VoicePlayer audioUrl={msg.audioUrl} isMine={msg.isMine} />
          ) : msg.type === 'image' ? (
            <img
              src={msg.imageUrl}
              alt="Sent image"
              className="max-w-[200px] sm:max-w-[250px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-md"
            />
          ) : (
            msg.text
          )}

          {/* Reaction badge */}
          {msg.reaction && (
            <div
              className="absolute -bottom-3 -right-1 bg-neutral-800 border border-neutral-700
                rounded-full px-1.5 py-0.5 text-[11px] shadow-md z-10 animate-slide-up
                cursor-pointer hover:scale-110 transition-transform"
            >
              {msg.reaction}
            </div>
          )}
        </div>

        {/* ── Actions RIGHT of bubble (stranger messages) ── */}
        {!msg.isMine && <Actions />}
      </div>
    </>
  );
}
