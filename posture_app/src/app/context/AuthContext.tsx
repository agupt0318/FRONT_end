import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  showOnLeaderboard: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePrivacySettings: (showOnLeaderboard: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for existing user session
    const storedUser = localStorage.getItem('posturetrack_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: 'user-1',
      name: email.split('@')[0],
      email,
      avatar: '👤',
      showOnLeaderboard: true,
    };
    
    setUser(newUser);
    localStorage.setItem('posturetrack_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('posturetrack_user');
    localStorage.removeItem('posturetrack_sessions');
  };

  const updatePrivacySettings = (showOnLeaderboard: boolean) => {
    if (user) {
      const updatedUser = { ...user, showOnLeaderboard };
      setUser(updatedUser);
      localStorage.setItem('posturetrack_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePrivacySettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
