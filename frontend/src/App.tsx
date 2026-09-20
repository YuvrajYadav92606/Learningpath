import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import RoadmapPage from './pages/RoadmapPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userId = useStore((s) => s.userId);
  if (!userId) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const userId = useStore((s) => s.userId);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        {userId && <Navbar />}
        <Routes>
          <Route path="/" element={userId ? <Navigate to="/chat" replace /> : <LandingPage />} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
