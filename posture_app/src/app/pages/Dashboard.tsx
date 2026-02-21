import { Activity, Award, Calendar, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { WeeklyChart } from '../components/WeeklyChart';
import { RecentSessions } from '../components/RecentSessions';
import { currentUser, weeklyData, recentSessions } from '../data/mockData';

export function Dashboard() {
  const avgScore = Math.round(
    recentSessions.reduce((acc, session) => acc + session.score, 0) / recentSessions.length
  );
  
  const totalDays = currentUser.totalDays;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your posture progress and achievements</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={Award}
          color="indigo"
          trend="+5%"
        />
        <StatCard
          title="Total Days"
          value={totalDays.toString()}
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Current Streak"
          value={`${currentUser.streak} days`}
          icon={Calendar}
          color="green"
          trend="+2 days"
        />
        <StatCard
          title="This Week"
          value={`7 days`}
          icon={TrendingUp}
          color="purple"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyChart data={weeklyData} />
        <RecentSessions sessions={recentSessions.slice(0, 5)} />
      </div>
    </div>
  );
}