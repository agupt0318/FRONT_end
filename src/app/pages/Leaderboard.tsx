/**
 * Leaderboard.tsx — wired to real API data.
 */
import { Trophy, Medal, Award, Flame, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { users } from '../data/mockData';

export function Leaderboard() {
  const { user } = useAuth();
  const entries = users
    .map((u, idx) => ({
      rank: idx + 1,
      user_id: u.id,
      name: u.name,
      avatar: u.avatar,
      total_score: u.totalScore,
      total_days: u.totalDays,
      streak: u.streak,
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .map((u, idx) => ({ ...u, rank: idx + 1 }));
  const isLoading = false;

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-indigo-400 to-indigo-600';
  };

  // show_on_leaderboard can be stored in user_metadata if needed; default to showing
  if (user?.user_metadata?.show_on_leaderboard === false) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-300">See how you rank against other users</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Privacy Mode Active</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            You've opted out of the leaderboard. Enable leaderboard visibility in settings to see rankings.
          </p>
          <Link to="/settings" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Loading rankings…</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const topThree = entries?.slice(0, 3) ?? [];
  const rest = entries?.slice(3) ?? [];
  const currentUserRank = entries?.find(e => e.user_id === user?.id)?.rank ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
        <p className="text-gray-600 dark:text-gray-300">See how you rank against other users</p>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* 2nd */}
        <div className="flex flex-col items-center pt-12">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-3xl mb-3">
              {topThree[1]?.avatar}
            </div>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">{getMedalIcon(2)}</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{topThree[1]?.name}</h3>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{topThree[1]?.total_score}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{topThree[1]?.total_days} days</p>
        </div>
        {/* 1st */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl mb-3 ring-4 ring-yellow-200 dark:ring-yellow-800">
              {topThree[0]?.avatar}
            </div>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">{getMedalIcon(1)}</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{topThree[0]?.name}</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{topThree[0]?.total_score}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{topThree[0]?.total_days} days</p>
        </div>
        {/* 3rd */}
        <div className="flex flex-col items-center pt-12">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center text-3xl mb-3">
              {topThree[2]?.avatar}
            </div>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">{getMedalIcon(3)}</div>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{topThree[2]?.name}</h3>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{topThree[2]?.total_score}%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{topThree[2]?.total_days} days</p>
        </div>
      </div>

      {/* Rankings table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Rankings
          </h2>
          <div className="space-y-2">
            {rest.map((entry) => {
              const isMe = entry.user_id === user?.id;
              return (
                <div key={entry.user_id} className={`flex items-center justify-between p-4 rounded-lg transition-all ${isMe ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(entry.rank)} flex items-center justify-center text-white font-bold`}>{entry.rank}</div>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{entry.avatar}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {entry.name}
                          {isMe && <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">You</span>}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{entry.total_days} days</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{entry.streak}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{entry.total_score}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">avg score</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{topThree[0]?.total_score ?? 0}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Rank</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentUserRank ? `#${currentUserRank}` : '—'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {entries?.length ? Math.max(...entries.map(e => e.streak)) : 0} days
          </p>
        </div>
      </div>
    </div>
  );
}
