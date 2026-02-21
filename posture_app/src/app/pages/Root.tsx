import { Outlet } from 'react-router';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export function Root() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}