import React from 'react';
import { MessageSquare, Star, Eye } from 'lucide-react';

export default function FeedbacksTable({ t, feedbacks, isLoading, onView }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left min-w-[900px]'>
        <thead className='bg-black/20 text-gray-400 text-sm'>
          <tr>
            <th className='px-6 py-5 font-semibold'>{t.USER}</th>
            <th className='px-6 py-5 font-semibold'>{t.RATING}</th>
            <th className='px-6 py-5 font-semibold'>{t.CONTENT}</th>
            <th className='px-6 py-5 font-semibold'>{t.DATE_SENT}</th>
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
          ) : feedbacks.length === 0 ? (
            <tr>
              <td colSpan='5' className='p-16 text-center text-gray-500'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 text-gray-600' />
                {t.NO_FEEDBACKS}
              </td>
            </tr>
          ) : (
            feedbacks.map((f) => (
              <tr key={f.id} className='hover:bg-white/5 transition-colors group'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <img
                      src={f.avatarUrl || 'https://via.placeholder.com/150'}
                      className='w-8 h-8 rounded-full object-cover border border-white/10'
                      alt=''
                    />
                    <span className='font-semibold text-gray-300 text-sm'>
                      {f.userName}
                    </span>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-1 text-amber-400'>
                    {[...Array(f.rating)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-current' />
                    ))}
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='text-gray-300 block max-w-[300px] truncate'>
                    {f.comment || (
                      <span className='text-gray-600 italic'>{t.NO_CONTENT}</span>
                    )}
                  </span>
                </td>
                <td className='px-6 py-5 text-gray-400 text-sm'>
                  {new Date(f.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className='px-6 py-5 text-right'>
                  <button
                    onClick={() => onView(f)}
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
