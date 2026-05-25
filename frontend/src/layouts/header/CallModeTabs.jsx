import React from 'react';
import { Video, Mic, MessageCircle } from 'lucide-react';
import useStore from '../../../store/useStore';

export default function CallModeTabs() {
  const { callMode, setCallMode, isMatching, isConnected } = useStore();
  const showCallTabs = !isMatching && !isConnected;

  return (
    <div className={`transition-all duration-300 ease-in-out flex-1 flex justify-center min-w-0 ${showCallTabs ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}`}>
      <div className="flex items-center bg-neutral-900 p-1 rounded-full border border-neutral-800">
        <button 
          onClick={() => setCallMode('video')}
          disabled={isMatching || isConnected}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${callMode === 'video' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
        >
          <Video className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Video</span>
        </button>
        <button 
          onClick={() => setCallMode('voice')}
          disabled={isMatching || isConnected}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${callMode === 'voice' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
        >
          <Mic className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Voice</span>
        </button>
        <button 
          onClick={() => setCallMode('text')}
          disabled={isMatching || isConnected}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-sm font-semibold transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${callMode === 'text' ? 'bg-[#1a1a1a] shadow-sm text-white' : 'text-gray-500 hover:text-white'}`}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline whitespace-nowrap">Text</span>
        </button>
      </div>
    </div>
  );
}
