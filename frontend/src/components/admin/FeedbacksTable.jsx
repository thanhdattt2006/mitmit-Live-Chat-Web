import React from 'react';
import { MessageSquare, Star } from 'lucide-react';

export default function FeedbacksTable({ t, feedbacks, isLoading }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-left min-w-[700px]'>
        <thead className='bg-black/20 text-gray-400 text-sm'>
          <tr>
            <th className='px-6 py-5 font-semibold'>{t.USER_ID}</th>
            <th className='px-6 py-5 font-semibold'>{t.RATING}</th>
            <th className='px-6 py-5 font-semibold'>{t.CONTENT}</th>
            <th className='px-6 py-5 font-semibold text-right'>{t.DATE_SENT}</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-white/5'>
          {isLoading ? (
            <tr>
              <td colSpan='4' className='p-10 text-center text-gray-500'>
                {t.LOADING_DATA}
              </td>
            </tr>
          ) : feedbacks.length === 0 ? (
            <tr>
              <td colSpan='4' className='p-16 text-center text-gray-500'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 text-gray-600' />
                {t.NO_FEEDBACKS}
              </td>
            </tr>
          ) : (
            feedbacks.map((f) => (
              <tr key={f.id} className='hover:bg-white/5 transition-colors group'>
                <td className='px-6 py-5'>
                  <span className='font-semibold text-gray-300 text-sm'>
                    {f.userId.substring(0, 8)}...
                  </span>
                </td>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-1 text-amber-400'>
                    {[...Array(f.rating)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-current' />
                    ))}
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='text-gray-300'>
                    {f.comment || (
                      <span className='text-gray-600 italic'>{t.NO_CONTENT}</span>
                    )}
                  </span>
                </td>
                <td className='px-6 py-5 text-right text-gray-400 text-sm'>
                  {new Date(f.createdAt).toLocaleDateString('vi-VN')}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
