import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Group from './pages/Group';
import './App.css'
const BASE_URL = import.meta.env.VITE_API_URL;
const Login = () => (
  <div style={{ padding: '48px 32px' }}>
    <h1>lol-dashboard-policraft</h1>
    <a href={`${BASE_URL}/auth/discord`}>
      <button>Accedi con Discord</button>
    </a>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Caricamento...</p>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/group" element={
        <ProtectedRoute>
          <Group />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;