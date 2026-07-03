import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useStore from './store/useStore';
import Header from './layouts/Header';
import RoomPage from './pages/RoomPage';
import AdminDashboard from './pages/AdminDashboard';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import FeedbackModal from './components/common/FeedbackModal';
import ProfanityWarningModal from './components/common/ProfanityWarningModal';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import bgPattern from './assets/bg-pattern.png';

function AppContent() {
  const { updateOnlineCount, isLoggedIn, userInfo } = useStore();
  const location = useLocation();
  const showHeader = location.pathname === '/';

  useEffect(() => {
    if (isLoggedIn && userInfo?.id) {
      import('./api/socketClient').then(({ default: socketService }) => {
        socketService.connect(userInfo.id, null, null).catch(err => console.error("Global STOMP connect error:", err));
      });
    } else {
      import('./api/socketClient').then(({ default: socketService }) => {
        socketService.disconnect();
      });
    }
  }, [isLoggedIn, userInfo?.id]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateOnlineCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [updateOnlineCount]);

  return (
    <div className="bg-[#0a0a0a] text-gray-100 h-screen w-full overflow-hidden flex flex-col antialiased selection:bg-white selection:text-black relative">
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 z-0" 
        style={{ backgroundImage: `url(${bgPattern})`, backgroundRepeat: 'repeat', backgroundSize: '200px' }}
      ></div>
      {showHeader && <Header />}
      <main className={`flex-1 min-h-0 flex w-full ${showHeader ? 'p-2 sm:p-4' : ''} gap-4 overflow-clip relative`}>
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route 
            path="/admin" 
            element={useStore().userInfo?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <FeedbackModal />
      <ProfanityWarningModal />
      <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
