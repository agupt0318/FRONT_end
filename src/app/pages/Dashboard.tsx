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
import { devicesApi, usersDataApi, Device, TelemetryRecord, ApiError } from '../../lib/apiClient';

// Map a telemetry record into the shape RecentSessions expects
function scoreFromPayload(record: TelemetryRecord) {
  const raw = Number(record.payload.potentiometer_value ?? 0);
  const normalized = ((8190 - raw) / 8190) * 100;
  return Math.round(Math.max(0, Math.min(100, normalized)));
}

function toSession(record: TelemetryRecord) {
  const score = scoreFromPayload(record);
  return {
    id: record.id,
    date: record.payload.timestamp ?? record.created_at,
    score,
  };
}

function toWeeklyPoint(record: TelemetryRecord) {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const score = scoreFromPayload(record);
  return {
    day: DAYS[new Date(record.payload.timestamp ?? record.created_at).getDay()],
    score,
  };
}

export function Dashboard() {
  const { user } = useAuth();
  const [devices, setDevices]     = useState<Device[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [readingsShown, setReadingsShown] = useState(50);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [devList, userTelemetry] = await Promise.all([
          devicesApi.list(),
          usersDataApi.list(),
        ]);
        if (cancelled) return;
        setDevices(devList);
        setTelemetry(userTelemetry);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const recentSessions = telemetry.slice(0, readingsShown).map(toSession);
  const weeklyData     = telemetry.slice(0, readingsShown).map(toWeeklyPoint).reverse();
  const avgScore       = recentSessions.length
    ? Math.round(recentSessions.reduce((a, s) => a + s.score, 0) / recentSessions.length)
    : 0;
  const scoreDelta     = recentSessions.length >= 2
    ? recentSessions[0].score - recentSessions[1].score
    : null;
  const trendLabel     = scoreDelta === null ? undefined : `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your posture progress and achievements</p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <label htmlFor="readings-shown" className="text-sm text-gray-600 dark:text-gray-300">
          Readings shown
        </label>
        <select
          id="readings-shown"
          value={readingsShown}
          onChange={(e) => setReadingsShown(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm"
        >
          {[50, 100, 150, 200, 250, 500, 1000, 2000].map((count) => (
            <option key={count} value={count}>{count}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Average Score"  value={isLoading ? '…' : `${avgScore}%`}         icon={Award}      color="indigo" trend={isLoading ? undefined : trendLabel} />
        <StatCard title="Devices"        value={isLoading ? '…' : devices.length.toString()} icon={Activity}   color="blue" />
        <StatCard title="Readings"       value={isLoading ? '…' : telemetry.length.toString()} icon={Calendar} color="green" />
        <StatCard title="This Week"      value={isLoading ? '…' : `${Math.min(weeklyData.length, 7)} days`} icon={TrendingUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart data={isLoading ? [] : weeklyData} />
        <RecentSessions
          sessions={isLoading ? [] : recentSessions}
          totalCount={telemetry.length}
          shownCount={readingsShown}
        />
      </div>
    </div>
  );
}
