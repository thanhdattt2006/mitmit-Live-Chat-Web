import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import Header from './layouts/Header';
import OnboardingPage from './pages/OnboardingPage';
import RoomPage from './pages/RoomPage';

export default function App() {
  const { theme, updateOnlineCount } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateOnlineCount();
    }, 5000);
    return () => clearInterval(interval);
  }, [updateOnlineCount]);

  return (
    <BrowserRouter>
      <div className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 h-screen w-screen overflow-hidden flex flex-col antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
        <Header />
        <main className="flex-1 flex w-full p-4 gap-4 overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Navigate to="/onboarding" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/room" element={<RoomPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
