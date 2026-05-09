import React, { useRef, useEffect } from 'react';
import useStore from '../../store/useStore';

export default function MessageList() {
  const { messages } = useStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scroll-smooth bg-[#fafafa] dark:bg-transparent">
      {messages?.map((msg) => {
        if (msg.type === 'system') {
          return (
            <div key={msg.id} className="flex justify-center w-full my-2 animate-fade-in">
              <span className="text-xs font-medium px-3 py-1 bg-gray-200 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 rounded-full text-center">
                {msg.text}
              </span>
            </div>
          );
        }

        const isMine = msg.isMine;
        return (
          <div key={msg.id} className={`flex w-full animate-slide-up ${isMine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm break-words ${
              isMine 
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-2xl rounded-br-sm' 
              : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-gray-100 border border-gray-100 dark:border-neutral-700 rounded-2xl rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
