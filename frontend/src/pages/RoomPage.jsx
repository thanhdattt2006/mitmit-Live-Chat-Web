import React, { useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import VideoBox from '../components/chat/VideoBox';
import ChatList from '../components/chat/ChatList';
import ChatInput from '../components/chat/ChatInput';
import { translations } from '../utils/translation';
import { MoreHorizontal } from 'lucide-react';

export default function RoomPage() {
  const navigate = useNavigate();
  const { userInfo, lang } = useStore();
  const t = translations[lang];

  useEffect(() => {
    if (!userInfo) {
      navigate('/onboarding');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row w-full gap-4 overflow-hidden">
      <VideoBox />

      <section className="w-full lg:max-w-[350px] xl:max-w-[400px] flex flex-col bg-white dark:bg-[#141414] rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm overflow-hidden h-full flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900/50 backdrop-blur-sm z-10 relative">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-700" alt="Stranger" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#141414] rounded-full"></div>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{t.STRANGER} <span className="text-xs text-gray-500 font-normal">#8429</span></h3>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-800">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <ChatList />
        <ChatInput />
      </section>
    </div>
  );
}
