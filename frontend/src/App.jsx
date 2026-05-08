import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import Room from './pages/Room';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/room" replace />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
