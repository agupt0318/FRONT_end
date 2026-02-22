/**
 * src/app/api/client.ts
 * 
 * Typed fetch wrapper for the FastAPI backend.
 * All requests automatically attach the JWT from localStorage.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types (mirror backend schemas.py)
// ---------------------------------------------------------------------------

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatar: string;
  total_score: number;
  total_days: number;
  streak: number;
  show_on_leaderboard: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

export interface PostureSession {
  id: string;
  user_id: string;
  date: string;            // "YYYY-MM-DD"
  duration: number;        // minutes
  good_posture_time: number;
  score: number;           // 0-100
}

export interface SessionCreate {
  date: string;
  duration: number;
  good_posture_time: number;
  score: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar: string;
  total_score: number;
  total_days: number;
  streak: number;
}

export interface UserUpdate {
  name?: string;
  show_on_leaderboard?: boolean;
}

// ---------------------------------------------------------------------------
// Token storage helpers
// ---------------------------------------------------------------------------

export const TOKEN_KEY = "posturetrack_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  async login(email: string, password: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    return data;
  },

  async register(email: string, password: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.access_token);
    return data;
  },

  async me(): Promise<UserPublic> {
    return request<UserPublic>("/api/auth/me");
  },

  logout(): void {
    clearToken();
  },
};

// ---------------------------------------------------------------------------
// Sessions API
// ---------------------------------------------------------------------------

export const sessionsApi = {
  list(limit = 7): Promise<PostureSession[]> {
    return request<PostureSession[]>(`/api/sessions/?limit=${limit}`);
  },

  get(id: string): Promise<PostureSession> {
    return request<PostureSession>(`/api/sessions/${id}`);
  },

  create(payload: SessionCreate): Promise<PostureSession> {
    return request<PostureSession>("/api/sessions/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  delete(id: string): Promise<void> {
    return request<void>(`/api/sessions/${id}`, { method: "DELETE" });
  },
};

// ---------------------------------------------------------------------------
// Users API
// ---------------------------------------------------------------------------

export const usersApi = {
  me(): Promise<UserPublic> {
    return request<UserPublic>("/api/users/me");
  },

  update(payload: UserUpdate): Promise<UserPublic> {
    return request<UserPublic>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
// Leaderboard API
// ---------------------------------------------------------------------------

export const leaderboardApi = {
  list(limit = 20): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(`/users/leaderboard?limit=${limit}`);
  },
};

export { ApiError };
