import React from 'react';
import { Shield, Users, Activity, Flag, ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSidebar({ t, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  return (
    <div className='hidden lg:flex w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex-col p-6 shadow-2xl z-10'>
      <div className='flex items-center gap-3 text-rose-500 mb-10 px-2'>
        <div className='p-2 bg-rose-500/20 rounded-xl border border-rose-500/30'>
          <Shield className='w-6 h-6' />
        </div>
        <h2 className='font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
          {t.ADMIN_PANEL_TITLE}
        </h2>
      </div>
      <nav className='flex-1 space-y-3'>
        <button className='w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 font-medium transition-all'>
          <Activity className='w-5 h-5 text-blue-400' /> {t.DASHBOARD}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-white/10 text-white shadow-lg border border-white/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className='w-5 h-5' /> {t.USER_MANAGEMENT}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${
            activeTab === 'reports'
              ? 'bg-white/10 text-white shadow-lg border border-white/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flag className='w-5 h-5' /> {t.REPORT_HANDLING}
        </button>
        <button
          onClick={() => setActiveTab('feedbacks')}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${
            activeTab === 'feedbacks'
              ? 'bg-white/10 text-white shadow-lg border border-white/5'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className='w-5 h-5 text-emerald-400' /> {t.FEEDBACKS}
        </button>
      </nav>
      <button
        onClick={() => navigate('/')}
        className='mt-auto w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent font-medium transition-all group'
      >
        <ArrowLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
        {t.RETURN_TO_APP}
      </button>
    </div>
  );
}
