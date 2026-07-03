import React from 'react';
import { CheckCircle, Eye } from 'lucide-react';

export default function ReportsTable({ t, reports, isLoading, onView }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left min-w-[1000px]'>
        <thead className='bg-black/20 text-gray-400 text-sm'>
          <tr>
            <th className='px-6 py-5 font-semibold'>{t.REPORTED_USER}</th>
            <th className='px-6 py-5 font-semibold'>{t.REPORTER}</th>
            <th className='px-6 py-5 font-semibold'>{t.DETAIL}</th>
            <th className='px-6 py-5 font-semibold'>{t.STATUS}</th>
            <th className='px-6 py-5 font-semibold text-right'>{t.ACTION}</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-white/5'>
          {isLoading ? (
            <tr>
              <td colSpan='5' className='p-10 text-center text-gray-500'>
                {t.LOADING_DATA}
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan='5' className='p-16 text-center text-gray-500'>
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
                  <div className='flex flex-col gap-1'>
                    <span className='px-2 py-1 rounded w-fit text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20'>
                      {r.reason}
                    </span>
                    <span className='text-sm text-gray-400 truncate max-w-[200px] block'>
                      {r.description || t.NO_DETAIL}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${r.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' : r.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                    {r.status}
                  </span>
                </td>
                <td className='px-6 py-5 text-right'>
                  <button
                    onClick={() => onView(r)}
                    className='inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5'
                  >
                    <Eye className='w-4 h-4' /> {t.VIEW}
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
