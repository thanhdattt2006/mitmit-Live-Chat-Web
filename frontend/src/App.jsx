import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Room from './pages/Room';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/room" replace />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}
