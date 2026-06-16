import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Shield, Users, Activity, Flag, CheckCircle, Ban, ArrowLeft, MessageSquare, Star, Unlock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { translations } from '../utils/translation';

export default function AdminDashboard() {
  const { userInfo, onlineCount, lang } = useStore();
  const t = translations[lang || 'vi'];
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'feedbacks', 'users'

  useEffect(() => {
    if (userInfo?.role === 'ADMIN') {
      if (activeTab === 'reports') fetchReports();
      if (activeTab === 'feedbacks') fetchFeedbacks();
      if (activeTab === 'users') fetchUsers();
    }
  }, [userInfo, activeTab]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/reports');
      setReports(res.data?.content || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách report", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/feedbacks');
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách feedback", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách người dùng", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type, reportId, reportedId) => {
    try {
      if (type === 'ignore') await axiosClient.post(`/api/v1/reports/${reportId}/ignore`);
      if (type === 'ban') {
        await axiosClient.post(`/api/v1/admin/ban/${reportedId}?reportId=${reportId}`);
        toast.success('Đã khóa tài khoản thành công!');
      }
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await axiosClient.post(`/api/v1/admin/unban/${userId}`);
      toast.success('Đã ân xá tài khoản!');
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' } : u));
    } catch (err) {
      console.error(err);
      toast.error('Không thể ân xá');
    }
  };

  if (userInfo?.role !== 'ADMIN') return null;

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:bg-neutral-900/60 group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${color}-500/20 rounded-full blur-2xl group-hover:bg-${color}-500/30 transition-all`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-14 h-14 bg-${color}-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-${color}-500/20`}>
          <Icon className={`w-7 h-7 text-${color}-400`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full h-full bg-[#050505] text-white overflow-hidden font-sans">
      {/* Sidebar (Glassmorphism) */}
      <div className="hidden lg:flex w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex-col p-6 shadow-2xl z-10">
        <div className="flex items-center gap-3 text-rose-500 mb-10 px-2">
          <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{t.ADMIN_PANEL_TITLE}</h2>
        </div>
        <nav className="flex-1 space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 font-medium transition-all">
            <Activity className="w-5 h-5 text-blue-400" /> {t.DASHBOARD}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${activeTab === 'users' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Users className="w-5 h-5" /> {t.USER_MANAGEMENT}
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${activeTab === 'reports' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Flag className="w-5 h-5" /> {t.REPORT_HANDLING}
          </button>
          <button 
            onClick={() => setActiveTab('feedbacks')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all ${activeTab === 'feedbacks' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className="w-5 h-5 text-emerald-400" /> {t.FEEDBACKS}
          </button>
        </nav>
        <button onClick={() => navigate('/')} className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-gray-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent font-medium transition-all group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> {t.RETURN_TO_APP}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">{t.SYSTEM_OVERVIEW}</h1>
              <p className="text-gray-400">{t.SYSTEM_OVERVIEW_DESC}</p>
            </div>
            <button onClick={() => navigate('/')} className="lg:hidden p-3 bg-white/10 rounded-xl"><ArrowLeft /></button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard icon={Users} label={t.TOTAL_USERS} value="1,248" color="blue" />
            <StatCard icon={Activity} label={t.ONLINE_USERS} value={onlineCount} color="emerald" />
            <StatCard icon={Flag} label={t.PENDING_REPORTS} value={reports.length} color="rose" />
          </div>

          {/* Table Area */}
          <div className="bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="px-8 py-6 border-b border-white/10 bg-white/5">
              <h2 className="font-bold text-xl">
                {activeTab === 'reports' && t.REPORTED_LIST}
                {activeTab === 'feedbacks' && t.FEEDBACK_LIST}
                {activeTab === 'users' && t.USER_LIST}
              </h2>
            </div>
            <div className="overflow-x-auto">
              {activeTab === 'reports' && (
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-gray-400 text-sm">
                    <tr>
                      <th className="px-8 py-5 font-semibold">{t.REPORTED_USER}</th>
                      <th className="px-8 py-5 font-semibold">{t.REPORTER}</th>
                      <th className="px-8 py-5 font-semibold">{t.REASON}</th>
                      <th className="px-8 py-5 font-semibold text-right">{t.ACTION}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr><td colSpan="4" className="p-10 text-center text-gray-500">{t.LOADING_DATA}</td></tr>
                    ) : reports.length === 0 ? (
                      <tr><td colSpan="4" className="p-16 text-center text-gray-500"><CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500/40" />{t.NO_REPORTS}</td></tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <img src={r.avatarUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" alt="" />
                              <span className="font-semibold text-gray-200">{r.reportedUser}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-gray-400">{r.reporter}</td>
                          <td className="px-8 py-5"><span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{r.reason}</span></td>
                          <td className="px-8 py-5 text-right space-x-3">
                            <button onClick={() => handleAction('ignore', r.id)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/10 transition-all">{t.IGNORE}</button>
                            <button onClick={() => handleAction('ban', r.id, r.reportedId)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5"><Ban className="w-4 h-4" /> {t.BAN_USER}</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
              {activeTab === 'feedbacks' && (
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-gray-400 text-sm">
                    <tr>
                      <th className="px-8 py-5 font-semibold">{t.USER_ID}</th>
                      <th className="px-8 py-5 font-semibold">{t.RATING}</th>
                      <th className="px-8 py-5 font-semibold">{t.CONTENT}</th>
                      <th className="px-8 py-5 font-semibold text-right">{t.DATE_SENT}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr><td colSpan="4" className="p-10 text-center text-gray-500">{t.LOADING_DATA}</td></tr>
                    ) : feedbacks.length === 0 ? (
                      <tr><td colSpan="4" className="p-16 text-center text-gray-500"><MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-600" />{t.NO_FEEDBACKS}</td></tr>
                    ) : (
                      feedbacks.map(f => (
                        <tr key={f.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <span className="font-semibold text-gray-300 text-sm">{f.userId.substring(0, 8)}...</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-1 text-amber-400">
                              {[...Array(f.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                          </td>
                          <td className="px-8 py-5"><span className="text-gray-300">{f.comment || <span className="text-gray-600 italic">{t.NO_CONTENT}</span>}</span></td>
                          <td className="px-8 py-5 text-right text-gray-400 text-sm">
                            {new Date(f.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
              {activeTab === 'users' && (
                <table className="w-full text-left">
                  <thead className="bg-black/20 text-gray-400 text-sm">
                    <tr>
                      <th className="px-8 py-5 font-semibold">{t.USER}</th>
                      <th className="px-8 py-5 font-semibold">{t.STATUS}</th>
                      <th className="px-8 py-5 font-semibold">{t.MATCH_COUNT}</th>
                      <th className="px-8 py-5 font-semibold text-right">{t.ACTION}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                      <tr><td colSpan="4" className="p-10 text-center text-gray-500">{t.LOADING_DATA}</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="4" className="p-16 text-center text-gray-500"><Users className="w-12 h-12 mx-auto mb-4 text-blue-500/40" />{t.NO_USERS}</td></tr>
                    ) : (
                      users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <img src={u.avatarUrl || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover border-2 border-white/10" alt="" />
                              <div>
                                <span className="font-semibold text-gray-200 block">{u.anonymousName || 'Anonymous'}</span>
                                <span className="text-xs text-gray-500">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            {u.status === 'BANNED' ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">BANNED</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">ACTIVE</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-gray-400 font-medium">{u.matchCount}</td>
                          <td className="px-8 py-5 text-right space-x-3">
                            {u.status === 'BANNED' && (
                              <button onClick={() => handleUnban(u.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"><Unlock className="w-4 h-4" /> {t.UNBAN}</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
