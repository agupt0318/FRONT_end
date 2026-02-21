/**
 * Tracker.tsx
 *
 * Shows today's posture data fetched from the FastAPI backend,
 * and lets the user pick which registered device to view.
 */
import { useEffect, useState } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { devicesApi, Device, TelemetryRecord, ApiError } from '../../lib/apiClient';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatTime(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

function scoreFromPayload(r: TelemetryRecord) {
  return Math.round(Math.min(100, r.payload.potentiometer_value * 100));
}

export function Tracker() {
  const { user } = useAuth();
  const [devices, setDevices]       = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [telemetry, setTelemetry]   = useState<TelemetryRecord[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');

  // Load device list on mount
  useEffect(() => {
    if (!user) return;
    devicesApi.list()
      .then(list => {
        setDevices(list);
        if (list.length > 0) setSelectedId(list[0].device_id);
      })
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load devices'))
      .finally(() => setIsLoading(false));
  }, [user]);

  // Load telemetry whenever selected device changes
  useEffect(() => {
    if (!selectedId) return;
    setIsLoading(true);
    setError('');
    devicesApi.getData(selectedId)
      .then(setTelemetry)
      .catch(err => setError(err instanceof ApiError ? err.message : 'Failed to load data'))
      .finally(() => setIsLoading(false));
  }, [selectedId]);

  const today = todayISO();
  const todayRecords = telemetry.filter(r => {
    const d = (r.payload.timestamp ?? r.created_at).split('T')[0];
    return d === today;
  });

  const avgScore = todayRecords.length
    ? Math.round(todayRecords.reduce((a, r) => a + scoreFromPayload(r), 0) / todayRecords.length)
    : null;

  const totalDuration = todayRecords.length; // 1 reading = 1 minute proxy
  const goodTime = avgScore !== null ? Math.round(totalDuration * avgScore / 100) : 0;

  const formatDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Tracking</h1>
          <p className="text-gray-600 dark:text-gray-300">{formatDate()}</p>
        </div>

        {/* Device picker + refresh */}
        <div className="flex items-center gap-3">
          {devices.length > 1 && (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {devices.map(d => (
                <option key={d.device_id} value={d.device_id}>{d.name}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => { if (selectedId) { setIsLoading(true); devicesApi.getData(selectedId).then(setTelemetry).finally(() => setIsLoading(false)); } }}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {!isLoading && devices.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Devices Registered</h2>
          <p className="text-gray-600 dark:text-gray-300">Register a device via the API to start tracking posture data.</p>
        </div>
      ) : !isLoading && avgScore === null ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data for Today</h2>
          <p className="text-gray-600 dark:text-gray-300">No telemetry received from your device today yet.</p>
        </div>
      ) : avgScore !== null && (
        <>
          {/* Score display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
                avgScore >= 90 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
                avgScore >= 80 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
                avgScore >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' :
                'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
              }`}>
                <TrendingUp className="w-16 h-16" />
              </div>
              <div className={`text-6xl font-bold mb-4 ${
                avgScore >= 90 ? 'text-green-600 dark:text-green-400' :
                avgScore >= 80 ? 'text-blue-600 dark:text-blue-400' :
                avgScore >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-orange-600 dark:text-orange-400'
              }`}>{avgScore}%</div>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {avgScore >= 90 ? 'Excellent posture today!' : avgScore >= 80 ? 'Great job today!' : avgScore >= 70 ? 'Good effort today!' : 'Room for improvement!'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todayRecords.length} readings from {devices.find(d => d.device_id === selectedId)?.name ?? selectedId}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(totalDuration)}</p>
              </div>
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Good Posture</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatTime(goodTime)}</p>
              </div>
              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bad Posture</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatTime(totalDuration - goodTime)}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Posture Breakdown</h3>
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 transition-all duration-500"
                style={{ width: `${avgScore}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{avgScore}% Good Posture</span>
              </div>
            </div>
          </div>

          {/* Raw readings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Readings ({todayRecords.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todayRecords.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{new Date(r.payload.timestamp ?? r.created_at).toLocaleTimeString()}</span>
                  <span className="font-medium text-gray-900 dark:text-white">Raw: {r.payload.potentiometer_value.toFixed(3)}</span>
                  <span className={`font-bold ${scoreFromPayload(r) >= 80 ? 'text-green-600' : 'text-red-500'}`}>{scoreFromPayload(r)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
