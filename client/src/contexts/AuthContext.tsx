import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const stored = localStorage.getItem('token');

        if (!stored) {
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        const payload = JSON.parse(atob(stored.split('.')[1]));

        if (!payload?.id) {
          throw new Error('Invalid token payload');
        }

        setToken(stored);
        setUser({
          id: payload.id,
          discord_id: payload.discord_id,
          username: payload.username,
          avatar: payload.avatar ?? null,
        });
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};