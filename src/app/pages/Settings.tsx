import { Shield, User, Bell, Eye, EyeOff, LogOut, Cpu, Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError, Device, devicesApi } from '../../lib/apiClient';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isSubmittingDevice, setIsSubmittingDevice] = useState(false);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [deviceError, setDeviceError] = useState('');
  const [deviceSuccess, setDeviceSuccess] = useState('');

  const displayName = user?.user_metadata?.full_name
    ?? user?.user_metadata?.name
    ?? user?.email?.split('@')[0]
    ?? 'User';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const loadDevices = async () => {
    if (!user) return;
    setIsLoadingDevices(true);
    setDeviceError('');
    try {
      const list = await devicesApi.list();
      setDevices(list);
    } catch (err) {
      setDeviceError(err instanceof ApiError ? err.message : 'Failed to load devices');
    } finally {
      setIsLoadingDevices(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [user]);

  const handleRegisterDevice = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedId = deviceId.trim();
    const trimmedName = deviceName.trim();
    const parsedId = Number(trimmedId);

    if (!trimmedId || !trimmedName) {
      setDeviceError('Device ID and name are required');
      return;
    }
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      setDeviceError('Device ID must be a positive integer (example: 1001)');
      return;
    }

    setIsSubmittingDevice(true);
    setDeviceError('');
    setDeviceSuccess('');
    try {
      await devicesApi.create(parsedId, trimmedName);
      setDeviceId('');
      setDeviceName('');
      setDeviceSuccess(`Device "${trimmedName}" registered`);
      await loadDevices();
    } catch (err) {
      setDeviceError(err instanceof ApiError ? err.message : 'Failed to register device');
    } finally {
      setIsSubmittingDevice(false);
    }
  };

  const handleDeleteDevice = async (id: string, name: string) => {
    const shouldDelete = window.confirm(`Delete device "${name}" (${id})?`);
    if (!shouldDelete) return;

    setDeletingDeviceId(id);
    setDeviceError('');
    setDeviceSuccess('');
    try {
      await devicesApi.delete(id);
      setDeviceSuccess(`Device "${name}" deleted`);
      await loadDevices();
    } catch (err) {
      setDeviceError(err instanceof ApiError ? err.message : 'Failed to delete device');
    } finally {
      setDeletingDeviceId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account and privacy preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
            <p className="text-lg text-gray-900 dark:text-white">{displayName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
            <p className="text-lg text-gray-900 dark:text-white">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Privacy Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {showOnLeaderboard
                  ? <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  : <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
                <h3 className="font-medium text-gray-900 dark:text-white">Show on Leaderboard</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When enabled, your scores and stats will be visible to other users on the leaderboard.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showOnLeaderboard}
                onChange={e => setShowOnLeaderboard(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {!showOnLeaderboard && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Privacy Mode Active</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">Your profile is hidden from the leaderboard.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Device management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Device Management</h2>
          </div>
          <button
            onClick={loadDevices}
            disabled={isLoadingDevices}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDevices ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <form onSubmit={handleRegisterDevice} className="grid md:grid-cols-3 gap-3 mb-4">
          <input
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            placeholder="Device ID (e.g. 1001)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmittingDevice}
          />
          <input
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
            placeholder="Device name (e.g. Desk Sensor)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmittingDevice}
          />
          <button
            type="submit"
            disabled={isSubmittingDevice}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isSubmittingDevice ? 'Registering...' : 'Register Device'}
          </button>
        </form>

        {deviceError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{deviceError}</p>
          </div>
        )}

        {deviceSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">{deviceSuccess}</p>
          </div>
        )}

        <div className="space-y-2">
          {isLoadingDevices ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">No devices registered yet.</p>
          ) : (
            devices.map(device => (
              <div
                key={device.device_id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{device.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{device.device_id}</p>
                </div>
                <button
                  onClick={() => handleDeleteDevice(device.device_id, device.name)}
                  disabled={deletingDeviceId === device.device_id}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingDeviceId === device.device_id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Session</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
