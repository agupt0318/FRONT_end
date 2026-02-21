/**
 * src/app/hooks/useApi.ts
 * 
 * Simple data-fetching hooks wrapping the API client.
 * Drop these into any page component to replace mock data.
 */

import { useState, useEffect, useCallback } from "react";
import {
  sessionsApi,
  leaderboardApi,
  usersApi,
  PostureSession,
  LeaderboardEntry,
  UserPublic,
  SessionCreate,
} from "../api/client";

// ---------------------------------------------------------------------------
// Generic async hook
// ---------------------------------------------------------------------------

function useAsync<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, isLoading, error, refetch: run };
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export function useSessions(limit = 7) {
  return useAsync<PostureSession[]>(() => sessionsApi.list(limit), [limit]);
}

export function useCreateSession() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSession = async (payload: SessionCreate): Promise<PostureSession | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await sessionsApi.create(payload);
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSession, isLoading, error };
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

export function useLeaderboard(limit = 20) {
  return useAsync<LeaderboardEntry[]>(() => leaderboardApi.list(limit), [limit]);
}

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

export function useProfile() {
  return useAsync<UserPublic>(() => usersApi.me(), []);
}

// ---------------------------------------------------------------------------
// Derived: weekly chart data from sessions
// ---------------------------------------------------------------------------

export interface WeeklyDataPoint {
  day: string;
  score: number;
  duration: number;
}

export function useWeeklyData(): { data: WeeklyDataPoint[]; isLoading: boolean } {
  const { data: sessions, isLoading } = useSessions(7);

  if (!sessions) return { data: [], isLoading };

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data: WeeklyDataPoint[] = sessions.map((s) => ({
    day: DAYS[new Date(s.date).getDay()],
    score: s.score,
    duration: s.duration,
  })).reverse(); // oldest first for the chart

  return { data, isLoading };
}
