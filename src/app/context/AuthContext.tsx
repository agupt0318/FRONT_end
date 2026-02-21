/**
 * src/app/context/AuthContext.tsx
 *
 * Supabase client-side auth.
 * The critical fix: expose `isLoading` so Root.tsx waits for the session
 * to rehydrate before deciding whether to redirect to /login.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user:      User | null;
  session:   Session | null;
  isLoading: boolean;           // true until Supabase has resolved the session
  login:          (email: string, password: string) => Promise<void>;
  signUp:         (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github')  => Promise<void>;
  logout:         () => Promise<void>;
  // Legacy compat — used by Settings page
  updatePrivacySettings: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User    | null>(null);
  const [session,   setSession]   = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);   // <-- starts true

  useEffect(() => {
    // 1. Rehydrate existing session from localStorage
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);   // <-- done loading
    });

    // 2. Keep state in sync with any future auth changes (login, logout, OAuth callback, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const loginWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Settings page calls this — no-op for now (privacy stored in DB)
  const updatePrivacySettings = (_show: boolean) => {};

  return (
    <AuthContext.Provider value={{
      user, session, isLoading,
      login, signUp, loginWithOAuth, logout,
      updatePrivacySettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
