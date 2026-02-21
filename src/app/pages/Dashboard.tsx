/**
 * Dashboard.tsx — fetches device data from the FastAPI backend.
 * The apiClient automatically attaches the Supabase JWT.
 */
import { useEffect, useState } from 'react';
import { Activity, Award, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { RecentSessions } from '../components/RecentSessions';
import { useAuth } from '../context/AuthContext';
import { devicesApi, Device, TelemetryRecord, ApiError } from '../../lib/apiClient';

// Map a telemetry record into the shape RecentSessions expects
function toSession(record: TelemetryRecord, index: number) {
  const score = Math.round(Math.min(100, record.payload.potentiometer_value * 100));
  return {
    id: record.id,
    userId: 'me',
    date: record.payload.timestamp ?? record.created_at,
    duration: 60,
    goodPostureTime: Math.round(60 * score / 100),
    score,
  };
}

function toWeeklyPoint(record: TelemetryRecord) {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const score = Math.round(Math.min(100, record.payload.potentiometer_value * 100));
  return {
    day: DAYS[new Date(record.payload.timestamp ?? record.created_at).getDay()],
    score,
    duration: 60,
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices]     = useState<Device[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const devList = await devicesApi.list();
        if (cancelled) return;
        setDevices(devList);

        // Fetch telemetry for the first device (if any)
        if (devList.length > 0) {
          const data = await devicesApi.getData(devList[0].device_id);
          if (!cancelled) setTelemetry(data);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const recentSessions = telemetry.slice(0, 5).map(toSession);
  const weeklyData     = telemetry.slice(0, 7).map(toWeeklyPoint).reverse();
  const avgScore       = recentSessions.length
    ? Math.round(recentSessions.reduce((a, s) => a + s.score, 0) / recentSessions.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your posture progress and achievements</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score"  value={isLoading ? '…' : `${avgScore}%`}         icon={Award}      color="indigo" trend="+5%" />
        <StatCard title="Devices"        value={isLoading ? '…' : devices.length.toString()} icon={Activity}   color="blue" />
        <StatCard title="Readings"       value={isLoading ? '…' : telemetry.length.toString()} icon={Calendar} color="green" />
        <StatCard title="This Week"      value={isLoading ? '…' : `${Math.min(weeklyData.length, 7)} days`} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart data={isLoading ? [] : weeklyData} />
        <RecentSessions sessions={isLoading ? [] : recentSessions} />
      </div>
    </div>
  );
}
