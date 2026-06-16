import React from 'react';
import VoicePlayer from '../../components/common/VoicePlayer';

export default function PrivateMessageBubble({ msg, friend, t, onViewImage }) {
  return (
    <div
      className={`relative max-w-[75%] text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap
        ${msg.type === 'IMAGE'
          ? ''
          : msg.isMine
            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2'
            : 'bg-neutral-800 text-gray-100 rounded-2xl rounded-bl-sm border border-neutral-700 px-3.5 py-2'
        }
        ${msg.type === 'VOICE' ? '!p-1.5' : ''}
        ${msg.isUploading ? 'opacity-60 pointer-events-none' : ''}`}
    >
      {msg.replyTo && (
        <div className={`mb-1.5 pl-2 border-l-2 text-xs opacity-80 ${msg.isMine ? 'border-white/50 text-white' : 'border-gray-500 text-gray-300'}`}>
          <p className="font-semibold text-[10px] mb-0.5">
            {msg.replyTo.isMine ? t.YOU : friend.name}
          </p>
          <p className="truncate">
            {msg.replyTo.type === 'VOICE' ? t.VOICE_MESSAGE : msg.replyTo.text}
          </p>
        </div>
      )}

      {msg.type === 'VOICE' ? (
        <VoicePlayer audioUrl={msg.audioUrl} isMine={msg.isMine} />
      ) : msg.type === 'IMAGE' ? (
        <img
          src={msg.imageUrl}
          alt="Sent image"
          onClick={() => {
            if (!msg.isUploading && onViewImage) {
              onViewImage(msg.imageUrl);
            }
          }}
          className={`max-w-[200px] sm:max-w-[250px] rounded-xl object-cover shadow-md ${
            msg.isUploading ? '' : 'cursor-pointer hover:opacity-90 transition-opacity'
          }`}
          style={!msg.isUploading ? { cursor: 'pointer' } : {}}
        />
      ) : (
        msg.text
      )}

      {msg.reaction && (
        <div className="absolute -bottom-3 -right-1 bg-neutral-800 border border-neutral-700 rounded-full px-1.5 py-0.5 text-[11px] shadow-md z-10 animate-slide-up cursor-pointer hover:scale-110 transition-transform">
          {msg.reaction}
        </div>
      )}

      {msg.isUploading && (
        <div className="absolute -bottom-5 right-0 text-[10px] text-gray-400 flex items-center gap-1 w-max">
          <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t.SENDING}
        </div>
      )}
    </div>
  );
}
