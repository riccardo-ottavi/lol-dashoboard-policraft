import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';

const Login = () => (
  <div style={{ padding: '48px 32px' }}>
    <h1>lol-dashboard-policraft</h1>
    <a href="http://localhost:3001/auth/discord">
      <button>Accedi con Discord</button>
    </a>
  </div>
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '32px' }}>
      <h1>Benvenuto, {user?.username}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

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
    </Routes>
  );
};

export default App;