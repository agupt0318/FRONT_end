import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { PostureSession } from '../data/mockData';

interface RecentSessionsProps {
  sessions: PostureSession[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Days</h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                session.score >= 90 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
                session.score >= 80 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
                'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(session.date)}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{session.duration} min tracked</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{session.score}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}