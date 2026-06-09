import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useStore from './store/useStore';
import Header from './layouts/Header';
import RoomPage from './pages/RoomPage';
import AdminDashboard from './pages/AdminDashboard';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

function AppContent() {
  const { updateOnlineCount } = useStore();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
    <div className="bg-[#0a0a0a] text-gray-100 h-screen w-full overflow-hidden flex flex-col antialiased selection:bg-white selection:text-black">
      {!isAdminRoute && <Header />}
      <main className={`flex-1 min-h-0 flex w-full ${isAdminRoute ? '' : 'p-2 sm:p-4'} gap-4 overflow-clip relative`}>
        <Routes>
          <Route path="/" element={<RoomPage />} />
          <Route 
            path="/admin" 
            element={useStore().userInfo?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Routes>
      </main>
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
