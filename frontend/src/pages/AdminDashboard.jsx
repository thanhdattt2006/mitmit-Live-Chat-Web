import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Users, Activity, Flag, ArrowLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import { translations } from '../utils/translation';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminMobileTabs from '../components/admin/AdminMobileTabs';
import AdminStatCard from '../components/admin/AdminStatCard';
import ReportsTable from '../components/admin/ReportsTable';
import FeedbacksTable from '../components/admin/FeedbacksTable';
import UsersTable from '../components/admin/UsersTable';

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
      fetchReports();
      fetchFeedbacks();
      fetchUsers();
    }
  }, [userInfo]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/reports');
      const data = res?.data || res;
      setReports(data?.content || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách report', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/feedbacks');
      const data = res?.data || res;
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách feedback', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/api/v1/users');
      const data = res?.data || res;
      setUsers(data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách người dùng', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type, reportId, reportedId) => {
    try {
      if (type === 'ignore')
        await axiosClient.post(`/api/v1/reports/${reportId}/ignore`);
      if (type === 'ban') {
        await axiosClient.post(`/api/v1/admin/ban/${reportedId}?reportId=${reportId}`);
        toast.success('Đã khóa tài khoản thành công!');
      }
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await axiosClient.post(`/api/v1/admin/unban/${userId}`);
      toast.success('Đã ân xá tài khoản!');
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: 'ACTIVE' } : u)));
    } catch (err) {
      console.error(err);
      toast.error('Không thể ân xá');
    }
  };

  if (userInfo?.role !== 'ADMIN') return null;

  return (
    <div className='flex w-full h-full bg-[#050505] text-white overflow-hidden font-sans'>
      <AdminSidebar t={t} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className='flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 relative'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-3/4 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none'></div>
        <div className='max-w-6xl mx-auto relative z-10'>
          
          <header className='mb-6 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight mb-1 md:mb-2'>{t.SYSTEM_OVERVIEW}</h1>
                <p className='text-sm md:text-base text-gray-400'>{t.SYSTEM_OVERVIEW_DESC}</p>
              </div>
              <button onClick={() => navigate('/')} className='lg:hidden p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors'>
                <ArrowLeft className='w-5 h-5' />
              </button>
            </div>
          </header>

          <AdminMobileTabs t={t} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10'>
            <AdminStatCard icon={Users} label={t.TOTAL_USERS} value={users.length} color='blue' />
            <AdminStatCard icon={Activity} label={t.ONLINE_USERS} value={onlineCount} color='emerald' />
            <AdminStatCard icon={Flag} label={t.PENDING_REPORTS} value={reports.length} color='rose' />
          </div>

          <div className='bg-neutral-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl'>
            <div className='px-4 md:px-8 py-5 md:py-6 border-b border-white/10 bg-white/5'>
              <h2 className='font-bold text-lg md:text-xl'>
                {activeTab === 'reports' && t.REPORTED_LIST}
                {activeTab === 'feedbacks' && t.FEEDBACK_LIST}
                {activeTab === 'users' && t.USER_LIST}
              </h2>
            </div>
            
            {activeTab === 'reports' && (
              <ReportsTable t={t} reports={reports} isLoading={isLoading} handleAction={handleAction} />
            )}
            {activeTab === 'feedbacks' && (
              <FeedbacksTable t={t} feedbacks={feedbacks} isLoading={isLoading} />
            )}
            {activeTab === 'users' && (
              <UsersTable t={t} users={users} isLoading={isLoading} handleUnban={handleUnban} />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
