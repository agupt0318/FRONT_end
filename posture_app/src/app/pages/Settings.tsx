import { Shield, User, Bell, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export function Settings() {
  const { user, updatePrivacySettings } = useAuth();
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user?.showOnLeaderboard ?? true);

  const handleToggleLeaderboard = (checked: boolean) => {
    setShowOnLeaderboard(checked);
    updatePrivacySettings(checked);
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
            <p className="text-lg text-gray-900 dark:text-white">{user?.name}</p>
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
                {showOnLeaderboard ? (
                  <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                )}
                <h3 className="font-medium text-gray-900 dark:text-white">Show on Leaderboard</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When enabled, your scores and stats will be visible to other users on the leaderboard.
                When disabled, you can still track your own progress privately.
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={showOnLeaderboard}
                onChange={(e) => handleToggleLeaderboard(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {!showOnLeaderboard && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Privacy Mode Active</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Your profile is hidden from the leaderboard. Only you can see your stats and progress.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Storage */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Data Storage</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Your posture tracking data is stored locally on your device. No data is sent to external servers.
          You can clear all data by logging out and clearing your browser storage.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Your privacy is protected</span>
        </div>
      </div>
    </div>
  );
}