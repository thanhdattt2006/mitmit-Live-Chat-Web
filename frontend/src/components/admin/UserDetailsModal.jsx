import { X, User, Unlock, Ban } from 'lucide-react';

export default function UserDetailsModal({ isOpen, onClose, user, handleAction, handleUnban, t }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-neutral-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slide-up text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-neutral-800 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
          <User className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">{t.USER_DETAILS}</h2>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <img src={user.avatarUrl || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-full border-2 border-white/10" alt="" />
            <div>
              <p className="font-semibold text-xl">{user.anonymousName || 'Anonymous'}</p>
              <p className="text-gray-400">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold border ${user.status === 'BANNED' ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'}`}>
                {user.status === 'BANNED' ? 'BANNED' : 'ACTIVE'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">User ID</p>
              <p className="font-mono text-sm truncate" title={user.id}>{user.id.substring(0, 8)}...</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">{t.MATCH_COUNT}</p>
              <p className="font-semibold text-lg">{user.matchCount || 0}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Role</p>
              <p className="font-semibold">{user.role}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-sm text-gray-400 mb-1">{t.DATE_SENT}</p>
              <p className="font-semibold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3 justify-end">
          {user.status === 'BANNED' ? (
            <button
              onClick={() => {
                handleUnban(user.id);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Unlock className="w-4 h-4" /> {t.UNBAN}
            </button>
          ) : (
            <button
              onClick={() => {
                handleAction('ban', { reportId: null, reportedId: user.id });
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <Ban className="w-4 h-4" /> {t.BAN_USER}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
