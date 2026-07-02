import React from 'react';
import { CheckCircle, Ban } from 'lucide-react';

export default function ReportsTable({ t, reports, isLoading, handleAction }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left min-w-[800px]'>
        <thead className='bg-black/20 text-gray-400 text-sm'>
          <tr>
            <th className='px-6 py-5 font-semibold'>{t.REPORTED_USER}</th>
            <th className='px-6 py-5 font-semibold'>{t.REPORTER}</th>
            <th className='px-6 py-5 font-semibold'>{t.REASON}</th>
            <th className='px-6 py-5 font-semibold text-right'>{t.ACTION}</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-white/5'>
          {isLoading ? (
            <tr>
              <td colSpan='4' className='p-10 text-center text-gray-500'>
                {t.LOADING_DATA}
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan='4' className='p-16 text-center text-gray-500'>
                <CheckCircle className='w-12 h-12 mx-auto mb-4 text-emerald-500/40' />
                {t.NO_REPORTS}
              </td>
            </tr>
          ) : (
            reports.map((r) => (
              <tr key={r.id} className='hover:bg-white/5 transition-colors group'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={r.avatarUrl || 'https://via.placeholder.com/150'}
                      className='w-10 h-10 rounded-full object-cover border-2 border-white/10'
                      alt=''
                    />
                    <span className='font-semibold text-gray-200'>
                      {r.reportedUser}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-5 text-gray-400'>{r.reporter}</td>
                <td className='px-6 py-5'>
                  <span className='px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20'>
                    {r.reason}
                  </span>
                </td>
                <td className='px-6 py-5 text-right space-x-2 md:space-x-3'>
                  <button
                    onClick={() => handleAction('ignore', r.id)}
                    className='px-3 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all'
                  >
                    {t.IGNORE}
                  </button>
                  <button
                    onClick={() => handleAction('ban', r.id, r.reportedId)}
                    className='inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5'
                  >
                    <Ban className='w-4 h-4' /> {t.BAN_USER}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
