import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Header from './layouts/Header';
import RoomPage from './pages/RoomPage';
import AdminDashboard from './pages/AdminDashboard';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

export default function App() {
  const { updateOnlineCount } = useStore();

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
    <BrowserRouter>
      <div className="bg-[#0a0a0a] text-gray-100 h-screen w-full overflow-hidden flex flex-col antialiased selection:bg-white selection:text-black">
        <Header />
        <main className="flex-1 flex w-full p-2 sm:p-4 gap-4 overflow-clip relative">
          <Routes>
            <Route path="/" element={<RoomPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
