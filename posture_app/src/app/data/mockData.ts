export interface PostureSession {
  id: string;
  userId: string;
  date: string;
  duration: number; // in minutes
  goodPostureTime: number; // in minutes
  score: number; // percentage
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  totalScore: number;
  totalDays: number;
  streak: number;
  showOnLeaderboard: boolean;
}

export const currentUser: User = {
  id: 'user-1',
  name: 'You',
  avatar: '👤',
  totalScore: 87,
  totalDays: 24,
  streak: 7,
  showOnLeaderboard: true,
};

export const users: User[] = [
  {
    id: 'user-2',
    name: 'Sarah Chen',
    avatar: '👩',
    totalScore: 94,
    totalDays: 42,
    streak: 12,
    showOnLeaderboard: true,
  },
  {
    id: 'user-3',
    name: 'Michael Torres',
    avatar: '👨',
    totalScore: 91,
    totalDays: 38,
    streak: 9,
    showOnLeaderboard: true,
  },
  {
    id: 'user-1',
    name: 'You',
    avatar: '👤',
    totalScore: 87,
    totalDays: 24,
    streak: 7,
    showOnLeaderboard: true,
  },
  {
    id: 'user-4',
    name: 'Emily Johnson',
    avatar: '👩‍💼',
    totalScore: 85,
    totalDays: 31,
    streak: 5,
    showOnLeaderboard: true,
  },
  {
    id: 'user-5',
    name: 'David Kim',
    avatar: '👨‍💻',
    totalScore: 82,
    totalDays: 28,
    streak: 6,
    showOnLeaderboard: true,
  },
  {
    id: 'user-6',
    name: 'Jessica Martinez',
    avatar: '👩‍🔬',
    totalScore: 79,
    totalDays: 22,
    streak: 4,
    showOnLeaderboard: true,
  },
  {
    id: 'user-7',
    name: 'James Wilson',
    avatar: '👨‍🎨',
    totalScore: 76,
    totalDays: 19,
    streak: 3,
    showOnLeaderboard: true,
  },
  {
    id: 'user-8',
    name: 'Lisa Anderson',
    avatar: '👩‍🏫',
    totalScore: 73,
    totalDays: 16,
    streak: 2,
    showOnLeaderboard: true,
  },
];

export const recentSessions: PostureSession[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    date: '2026-02-21',
    duration: 120,
    goodPostureTime: 98,
    score: 82,
  },
  {
    id: 'session-2',
    userId: 'user-1',
    date: '2026-02-20',
    duration: 180,
    goodPostureTime: 162,
    score: 90,
  },
  {
    id: 'session-3',
    userId: 'user-1',
    date: '2026-02-19',
    duration: 150,
    goodPostureTime: 135,
    score: 90,
  },
  {
    id: 'session-4',
    userId: 'user-1',
    date: '2026-02-18',
    duration: 90,
    goodPostureTime: 75,
    score: 83,
  },
  {
    id: 'session-5',
    userId: 'user-1',
    date: '2026-02-17',
    duration: 120,
    goodPostureTime: 102,
    score: 85,
  },
  {
    id: 'session-6',
    userId: 'user-1',
    date: '2026-02-16',
    duration: 105,
    goodPostureTime: 89,
    score: 85,
  },
  {
    id: 'session-7',
    userId: 'user-1',
    date: '2026-02-15',
    duration: 135,
    goodPostureTime: 115,
    score: 85,
  },
];

export const weeklyData = [
  { day: 'Mon', score: 85, duration: 105 },
  { day: 'Tue', score: 85, duration: 135 },
  { day: 'Wed', score: 83, duration: 90 },
  { day: 'Thu', score: 90, duration: 150 },
  { day: 'Fri', score: 90, duration: 180 },
  { day: 'Sat', score: 82, duration: 120 },
  { day: 'Sun', score: 88, duration: 95 },
];