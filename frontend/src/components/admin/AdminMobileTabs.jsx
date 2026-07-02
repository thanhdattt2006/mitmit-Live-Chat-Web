import React from 'react';
import { Users, Flag, MessageSquare } from 'lucide-react';

export default function AdminMobileTabs({ t, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'reports', icon: Flag, label: t.REPORT_HANDLING },
    { id: 'feedbacks', icon: MessageSquare, label: t.FEEDBACKS },
    { id: 'users', icon: Users, label: t.USER_MANAGEMENT },
  ];

  return (
    <div className='lg:hidden flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide'>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white/10 text-white border border-white/20 shadow-lg'
              : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
          }`}
        >
          <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
