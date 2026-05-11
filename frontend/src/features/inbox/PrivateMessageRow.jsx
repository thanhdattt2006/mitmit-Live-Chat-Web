import React from 'react';
import { Smile, MoreVertical, Copy, Reply, Trash2 } from 'lucide-react';
import VoicePlayer from '../../components/common/VoicePlayer';

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
  setReplyingTo 
}) {
  return (
    <div className={`flex w-full animate-slide-up hover:z-50 focus-within:z-50 pr-16 ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group flex items-center gap-2 max-w-[85%]">
        
        {/* Bubble */}
        <div className={`relative w-full text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap overflow-wrap-anywhere ${
          msg.isMine 
          ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
          : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700'
        } ${msg.type === 'voice' ? 'p-0 overflow-hidden' : 'px-3.5 py-2'}`}>
          
          {/* Premium Reaction Picker */}
          {activeReactionId === msg.id && (
            <div className="absolute bottom-full mb-2 left-0 flex gap-2 bg-[#2d2d30]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/10 z-[9999] animate-slide-up origin-bottom-left">
              {['👍', '❤️', '😂', '😮', '😢'].map(e => (
                <button key={e} onClick={(ev) => { ev.stopPropagation(); handleReact(msg.id, e); }} className="hover:scale-125 transition-transform origin-bottom text-lg">{e}</button>
              ))}
            </div>
          )}

          {/* Replied Message Block */}
          {msg.replyTo && (
            <div className={`mb-1.5 pl-2 border-l-2 text-xs opacity-80 ${msg.isMine ? 'border-white/50 text-white' : 'border-gray-500 text-gray-300'}`}>
              <p className="font-semibold text-[10px] mb-0.5">{msg.replyTo.isMine ? t.YOU : friend.name}</p>
              <p className="truncate">{msg.replyTo.type === 'voice' ? t.VOICE_MESSAGE : msg.replyTo.text}</p>
            </div>
          )}

          {msg.type === 'voice' ? (
            <VoicePlayer audioUrl={msg.audioUrl} isMine={msg.isMine} />
          ) : (
            msg.text
          )}

          {/* Reaction Badge */}
          {msg.reaction && (
            <div className="absolute -bottom-2 -right-2 bg-neutral-800 border border-neutral-700 rounded-full px-1.5 py-0.5 text-[10px] shadow-md z-10 animate-slide-up cursor-pointer hover:scale-110 transition-transform">
              {msg.reaction}
            </div>
          )}
        </div> {/* End Bubble */}

        {/* Actions (Always on the RIGHT) */}
        <div className={`absolute left-full ml-1 items-center gap-1 shrink-0 z-50 ${(activeMenuId === msg.id || activeReactionId === msg.id) ? 'flex' : 'hidden group-hover:flex'}`}>
          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setActiveReactionId(activeReactionId === msg.id ? null : msg.id); setActiveMenuId(null); }} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-full hover:bg-neutral-800 transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === msg.id ? null : msg.id); setActiveReactionId(null); }} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-full hover:bg-neutral-800 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
            {activeMenuId === msg.id && (
              <div className="absolute top-full right-0 origin-top-right mt-1 w-max bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden z-[9999] animate-slide-up">
                {msg.type !== 'voice' && (
                  <button onClick={() => handleCopy(msg.text)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700">
                    <Copy className="w-3.5 h-3.5" /> {t.COPY}
                  </button>
                )}
                <button onClick={() => { setReplyingTo(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-neutral-700">
                  <Reply className="w-3.5 h-3.5" /> {t.REPLY}
                </button>
                {msg.isMine && (
                  <button onClick={() => handleUnsend(msg.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" /> {t.UNSEND}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
