import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import VideoBox from '../components/chat/VideoBox';
import ChatList from '../components/chat/ChatList';
import ChatInput from '../components/chat/ChatInput';
import { translations } from '../utils/translation';
import { MoreHorizontal, MessageCircle } from 'lucide-react';

export default function RoomPage() {
  const navigate = useNavigate();
  const { userInfo, lang, callMode, isConnected } = useStore();
  const t = translations[lang];

  useEffect(() => {
    if (!userInfo) {
      navigate('/onboarding');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full gap-4 overflow-hidden relative">
      
      {/* LEFT: Video/Voice/Text Control Area */}
      <VideoBox />

      {/* RIGHT: Chat Area */}
      <section className={`w-full flex flex-col bg-[#141414] rounded-3xl border border-neutral-800 shadow-sm overflow-hidden h-full flex-shrink-0 transition-all duration-500 ${callMode === 'text' ? 'lg:w-[60%] xl:w-[70%]' : 'lg:w-[30%] lg:min-w-[350px] lg:max-w-[400px]'}`}>
        
        {isConnected ? (
          <>
            <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50 backdrop-blur-sm z-10 relative">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover border border-neutral-700" alt="Stranger" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#141414] rounded-full"></div>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{t.STRANGER} <span className="text-xs text-gray-500 font-normal">#8429</span></h3>
                  <p className="text-xs text-green-400 font-medium truncate">Online</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-neutral-800 shrink-0">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            <ChatList />
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] text-center p-6">
            <div>
              <MessageCircle className="w-16 h-16 text-neutral-800 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">{t.READY_TO_CONNECT}</p>
              <p className="text-neutral-600 text-sm mt-2">{t.PRESS_START}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
