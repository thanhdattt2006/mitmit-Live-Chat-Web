import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { translations } from '../utils/translation';
import { Shield, Users, Activity, Flag, Trash2, CheckCircle, Ban } from 'lucide-react';
import axiosClient from '../api/axiosClient';

export default function AdminDashboard() {
  const { userInfo, lang, onlineCount } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userInfo?.role === 'ADMIN') {
      fetchReports();
    }
  }, [userInfo]);

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

  if (userInfo?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] w-full h-full p-4">
        <div className="bg-[#141414] border border-neutral-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-slide-up text-center">
          <Shield className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
          <p className="text-gray-400 text-sm mb-8">Restricted area. Please login with administrator credentials to access the dashboard.</p>
          <div className="space-y-3">
            <input type="password" placeholder="Admin PIN Code" className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center tracking-widest outline-none focus:border-rose-500/50" />
            <button className="w-full py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all active:scale-95">
              Login as Admin
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-xl font-semibold bg-transparent hover:bg-neutral-800 text-gray-400 hover:text-white transition-all active:scale-95"
            >
              Return to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleIgnore = async (id) => {
    try {
      await axiosClient.post(`/api/v1/reports/${id}/ignore`);
      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBan = async (id, reportedId) => {
    try {
      await axiosClient.post(`/api/v1/admin/ban/${reportedId}?reportId=${id}`);
      
      const toast = document.createElement('div');
      toast.className = 'fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl font-medium animate-slide-up flex items-center gap-2';
      toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> <span>${t.BAN_SUCCESS || 'User banned successfully'}</span>`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3000);

      setReports(reports.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex w-full h-full gap-4 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden lg:flex w-64 bg-[#141414] rounded-3xl border border-neutral-800 flex-col p-6 shadow-sm shrink-0">
        <div className="flex items-center gap-3 text-rose-500 mb-8">
          <Shield className="w-8 h-8" />
          <h2 className="font-bold text-xl tracking-tight">{t.ADMIN_DASHBOARD}</h2>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-800 text-white font-medium transition-colors">
            <Activity className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-neutral-800/50 font-medium transition-colors">
            <Users className="w-5 h-5" /> Users
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-neutral-800/50 font-medium transition-colors">
            <Flag className="w-5 h-5" /> Reports
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#141414] rounded-3xl border border-neutral-800 overflow-y-auto shadow-sm p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{t.ADMIN_DASHBOARD}</h1>
          <p className="text-gray-400 text-sm">Monitor user activity and manage reports.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{t.TOTAL_USERS}</p>
              <h3 className="text-2xl font-bold text-white">45,231</h3>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{t.ONLINE_USERS}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <h3 className="text-2xl font-bold text-white">{onlineCount.toLocaleString()}</h3>
              </div>
            </div>
          </div>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center shrink-0">
              <Flag className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{t.PENDING_REPORTS}</p>
              <h3 className="text-2xl font-bold text-white">{reports.length}</h3>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
            <h2 className="font-semibold text-lg">{t.REPORT_LIST}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-neutral-900/30">
                <tr>
                  <th className="px-6 py-4 font-medium">{t.REPORTED_USER}</th>
                  <th className="px-6 py-4 font-medium">{t.REPORTER}</th>
                  <th className="px-6 py-4 font-medium">{t.REASON}</th>
                  <th className="px-6 py-4 font-medium text-right">{t.ACTION}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500/50" />
                      No pending reports. Great job!
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={report.avatarUrl || 'https://via.placeholder.com/150'} alt="" className="w-8 h-8 rounded-full object-cover border border-neutral-700" />
                          <span className="font-medium text-white">{report.reportedUser}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{report.reporter}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          {report.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleIgnore(report.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            {t.IGNORE}
                          </button>
                          <button 
                            onClick={() => handleBan(report.id, report.reportedId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all shadow-sm"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            {t.BAN_USER}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
