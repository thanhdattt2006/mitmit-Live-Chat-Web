import React from 'react';
import { Smile, MoreVertical, Copy, Reply, Trash2 } from 'lucide-react';
import VoicePlayer from '../../components/common/VoicePlayer';

/**
 * @param {object} props
 * @param {{ id: string, type: string, text?: string, audioUrl?: string, isMine: boolean, reaction?: string, replyTo?: object }} props.msg
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

  /** The 😊 + ⋮ action cluster, shown on row-hover or when popup is open */
  const Actions = () => (
    <div
      className={`flex items-center gap-0.5 shrink-0 transition-opacity duration-200
        opacity-0 group-hover:opacity-100
        ${isMenuOpen || isReactionOpen ? '!opacity-100' : ''}`}
    >
      {/* Reaction button — picker pops UP as sibling of bubble (handled below) */}
      <button
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

      {/* More-actions button */}
      <div className="relative">
        <button
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

        {/* Dropdown — anchored to button, z-[999] so it floats above everything */}
        {isMenuOpen && (
          <div
            className={`absolute bottom-full mb-1 w-max bg-neutral-800 border border-neutral-700
              rounded-xl shadow-2xl z-[999] animate-slide-up
              ${msg.isMine ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {msg.type !== 'voice' && (
              <button
                onClick={() => handleCopy(msg.text)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors rounded-t-xl"
              >
                <Copy className="w-3.5 h-3.5" /> {t.COPY}
              </button>
            )}
            <button
              onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700 transition-colors"
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
          </div>
        )}
      </div>
    </div>
  );

  return (
    /**
     * Outermost row wrapper:
     * - `group` → enables group-hover on Actions
     * - `relative` → stacking context anchor
     * - `group-hover:z-10` via inline style trick below (Tailwind purge-safe)
     * - explicit `z-auto` → only lift on hover via JS className
     */
    <div
      className={`group relative flex items-end gap-2 w-full animate-slide-up
        ${isMenuOpen || isReactionOpen ? 'z-20' : 'z-auto hover:z-10'}
        ${msg.isMine ? 'justify-end' : 'justify-start'}`}
    >
      {/* ── Actions LEFT of bubble (my messages) ── */}
      {msg.isMine && (
        <div className="relative flex flex-col items-end">
          {/* Reaction Picker pops ABOVE the action cluster */}
          {isReactionOpen && (
            <div
              className={`absolute bottom-full mb-2 z-[999] flex gap-2
                bg-[#2d2d30]/95 backdrop-blur-md px-3 py-1.5
                rounded-full shadow-xl border border-white/10 animate-slide-up
                right-0 origin-bottom-right`}
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
            </div>
          )}
          <Actions />
        </div>
      )}

      {/* ── Chat Bubble ── */}
      <div
        className={`relative max-w-[75%] text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap
          ${msg.isMine
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700'}
          ${msg.type === 'voice' ? 'p-0 overflow-hidden' : 'px-3.5 py-2'}`}
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
      {!msg.isMine && (
        <div className="relative flex flex-col items-start">
          {/* Reaction Picker pops ABOVE */}
          {isReactionOpen && (
            <div
              className={`absolute bottom-full mb-2 z-[999] flex gap-2
                bg-[#2d2d30]/95 backdrop-blur-md px-3 py-1.5
                rounded-full shadow-xl border border-white/10 animate-slide-up
                left-0 origin-bottom-left`}
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
            </div>
          )}
          <Actions />
        </div>
      )}
    </div>
  );
}
