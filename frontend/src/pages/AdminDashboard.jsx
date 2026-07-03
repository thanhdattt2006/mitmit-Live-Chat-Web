import { useEffect, useState, useCallback } from 'react';
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
import ConfirmModal from '../components/common/ConfirmModal';
import ReportDetailsModal from '../components/admin/ReportDetailsModal';
import FeedbackDetailsModal from '../components/admin/FeedbackDetailsModal';

export default function AdminDashboard() {
  const { userInfo, onlineCount, lang } = useStore();
  const t = translations[lang || 'vi'];
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports');
  const [reportStatus, setReportStatus] = useState('ALL');

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', payload: null, title: '', message: '', isDanger: false });
  const [reportDetails, setReportDetails] = useState(null);
  const [feedbackDetails, setFeedbackDetails] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get(`/api/v1/reports?status=${reportStatus}`);
      const data = res?.data || res;
      setReports(data?.content || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách report', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportStatus]);

  const fetchFeedbacks = useCallback(async () => {
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
  }, []);

  const fetchUsers = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    if (userInfo?.role === 'ADMIN') {
      fetchFeedbacks();
      fetchUsers();
    }
  }, [userInfo, fetchFeedbacks, fetchUsers]);

  useEffect(() => {
    if (userInfo?.role === 'ADMIN') {
      fetchReports();
    }
  }, [userInfo, fetchReports]);

  const handleAction = (type, payload) => {
    if (type === 'ignore') {
      setConfirmModal({ isOpen: true, type, payload, title: t.IGNORE, message: 'Bạn có chắc chắn muốn bỏ qua báo cáo này?', isDanger: false });
    } else if (type === 'ban') {
      setConfirmModal({ isOpen: true, type, payload, title: t.BAN_USER, message: 'Bạn có chắc chắn muốn CẤM tài khoản này vĩnh viễn?', isDanger: true });
    }
  };

  const handleUnban = (userId) => {
    setConfirmModal({ isOpen: true, type: 'unban', payload: userId, title: t.UNBAN, message: 'Bạn có chắc chắn muốn Ân xá cho tài khoản này?', isDanger: false });
  };

  const executeConfirmAction = async () => {
    const { type, payload } = confirmModal;
    setConfirmModal({ ...confirmModal, isOpen: false });

    try {
      if (type === 'ignore') {
        await axiosClient.post(`/api/v1/reports/${payload}/ignore`);
        toast.success('Đã bỏ qua báo cáo!');
        fetchReports();
      } else if (type === 'ban') {
        await axiosClient.post(`/api/v1/admin/ban/${payload.reportedId}?reportId=${payload.reportId}`);
        toast.success(t.BAN_SUCCESS || 'Đã khóa tài khoản thành công!');
        fetchReports();
        fetchUsers();
        if (reportDetails) setReportDetails(null);
      } else if (type === 'unban') {
        await axiosClient.post(`/api/v1/admin/unban/${payload}`);
        toast.success('Đã ân xá tài khoản!');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      toast.error(t.ERROR_OCCURRED || 'Có lỗi xảy ra');
    }
  };

  if (userInfo?.role !== 'ADMIN') return null;

  return (
    <div className='flex w-full h-full bg-[#050505] text-white overflow-hidden font-sans'>
      <AdminSidebar t={t} activeTab={activeTab} setActiveTab={setActiveTab} />
      
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
            <div className='px-4 md:px-8 py-5 md:py-6 border-b border-white/10 bg-white/5 flex items-center justify-between'>
              <h2 className='font-bold text-lg md:text-xl'>
                {activeTab === 'reports' && t.REPORTED_LIST}
                {activeTab === 'feedbacks' && t.FEEDBACK_LIST}
                {activeTab === 'users' && t.USER_LIST}
              </h2>
              {activeTab === 'reports' && (
                <select 
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                  <option value="ALL">ALL</option>
                  <option value="PENDING">PENDING</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="DISMISSED">DISMISSED</option>
                </select>
              )}
            </div>
            
            {activeTab === 'reports' && (
              <ReportsTable t={t} reports={reports} isLoading={isLoading} handleAction={handleAction} onView={(r) => setReportDetails(r)} />
            )}
            {activeTab === 'feedbacks' && (
              <FeedbacksTable t={t} feedbacks={feedbacks} isLoading={isLoading} onView={(f) => setFeedbackDetails(f)} />
            )}
            {activeTab === 'users' && (
              <UsersTable t={t} users={users} isLoading={isLoading} handleUnban={handleUnban} handleBan={(u) => handleAction('ban', { reportId: null, reportedId: u.id })} />
            )}
          </div>
          
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />

      {reportDetails && (
        <ReportDetailsModal 
          isOpen={!!reportDetails} 
          onClose={() => setReportDetails(null)} 
          report={reportDetails} 
          handleAction={handleAction} 
          t={t} 
        />
      )}

      {feedbackDetails && (
        <FeedbackDetailsModal 
          isOpen={!!feedbackDetails} 
          onClose={() => setFeedbackDetails(null)} 
          feedback={feedbackDetails} 
          t={t} 
        />
      )}
    </div>
  );
}
