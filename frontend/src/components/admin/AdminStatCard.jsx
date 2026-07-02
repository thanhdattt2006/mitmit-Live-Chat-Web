import React from 'react';

export default function AdminStatCard({ icon: Icon, label, value, color }) {
  return (
    <div className='relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-6 transition-all hover:scale-[1.02] hover:bg-neutral-900/60 group'>
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-500/20 rounded-full blur-2xl group-hover:bg-${color}-500/30 transition-all`}
      ></div>
      <div className='flex items-center gap-4 relative z-10'>
        <div
          className={`w-12 h-12 md:w-14 md:h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-${color}-500/20`}
        >
          <Icon className={`w-6 h-6 md:w-7 md:h-7 text-${color}-400`} />
        </div>
        <div>
          <p className='text-xs md:text-sm font-medium text-gray-400 mb-1'>{label}</p>
          <h3 className='text-2xl md:text-3xl font-bold text-white tracking-tight'>
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
