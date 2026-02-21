import { useEffect, useState } from 'react';
import { Calendar, Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

interface DayData {
  date: string;
  duration: number;
  goodPostureTime: number;
  score: number;
}

export function Tracker() {
  const [todayData, setTodayData] = useState<DayData | null>(null);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const sessions = JSON.parse(localStorage.getItem('posturetrack_sessions') || '[]');
    const todaySession = sessions.find((s: any) => s.date === today);
    
    if (todaySession) {
      setTodayData(todaySession);
    }
  }, []);
  
  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Today's Tracking</h1>
        <p className="text-gray-600 dark:text-gray-300">{formatDate()}</p>
      </div>

      {todayData ? (
        <>
          {/* Main Score Display */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
                todayData.score >= 90 ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
                todayData.score >= 80 ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
                todayData.score >= 70 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' :
                'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
              }`}>
                <TrendingUp className="w-16 h-16" />
              </div>
              
              <div className="text-6xl font-bold mb-4">
                <span className={
                  todayData.score >= 90 ? 'text-green-600 dark:text-green-400' :
                  todayData.score >= 80 ? 'text-blue-600 dark:text-blue-400' :
                  todayData.score >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-orange-600 dark:text-orange-400'
                }>
                  {todayData.score}%
                </span>
              </div>
              
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {todayData.score >= 90 && 'Excellent posture today!'}
                {todayData.score >= 80 && todayData.score < 90 && 'Great job today!'}
                {todayData.score >= 70 && todayData.score < 80 && 'Good effort today!'}
                {todayData.score < 70 && 'Room for improvement!'}
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatTime(todayData.duration)}</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Good Posture</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatTime(todayData.goodPostureTime)}</p>
              </div>
              
              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bad Posture</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatTime(todayData.duration - todayData.goodPostureTime)}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Posture Breakdown</h3>
            <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 transition-all duration-500"
                style={{ width: `${todayData.score}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {todayData.score}% Good Posture
                </span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{formatTime(todayData.goodPostureTime)} good</span>
              <span>{formatTime(todayData.duration - todayData.goodPostureTime)} needs work</span>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data for Today</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            You haven't tracked any posture data today yet. Data is logged automatically throughout your day.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is a demo app - in production, this would connect to real posture tracking hardware or software.
          </p>
        </div>
      )}
    </div>
  );
}