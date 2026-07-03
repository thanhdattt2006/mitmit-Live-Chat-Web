import React from 'react';
import { Users, Unlock, Ban } from 'lucide-react';

export default function UsersTable({ t, users, isLoading, handleUnban, handleBan }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left min-w-[700px]'>
        <thead className='bg-black/20 text-gray-400 text-sm'>
          <tr>
            <th className='px-6 py-5 font-semibold'>{t.USER}</th>
            <th className='px-6 py-5 font-semibold'>{t.STATUS}</th>
            <th className='px-6 py-5 font-semibold'>{t.MATCH_COUNT}</th>
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
          ) : users.length === 0 ? (
            <tr>
              <td colSpan='4' className='p-16 text-center text-gray-500'>
                <Users className='w-12 h-12 mx-auto mb-4 text-blue-500/40' />
                {t.NO_USERS}
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id} className='hover:bg-white/5 transition-colors group'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <img
                      src={u.avatarUrl || 'https://via.placeholder.com/150'}
                      className='w-10 h-10 rounded-full object-cover border-2 border-white/10'
                      alt=''
                    />
                    <div>
                      <span className='font-semibold text-gray-200 block'>
                        {u.anonymousName || 'Anonymous'}
                      </span>
                      <span className='text-xs text-gray-500 truncate max-w-[120px] md:max-w-none block'>
                        {u.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  {u.status === 'BANNED' ? (
                    <span className='px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30'>
                      BANNED
                    </span>
                  ) : (
                    <span className='px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'>
                      ACTIVE
                    </span>
                  )}
                </td>
                <td className='px-6 py-5 text-gray-400 font-medium'>
                  {u.matchCount}
                </td>
                <td className='px-6 py-5 text-right space-x-3'>
                  {u.status === 'BANNED' ? (
                    <button
                      onClick={() => handleUnban(u.id)}
                      className='inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5'
                    >
                      <Unlock className='w-4 h-4' /> {t.UNBAN}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBan(u)}
                      className='inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5'
                    >
                      <Ban className='w-4 h-4' /> {t.BAN_USER}
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
