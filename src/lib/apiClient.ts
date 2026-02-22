/**
 * src/lib/apiClient.ts
 *
 * Typed fetch wrapper for the FastAPI backend.
 *
 * Flow:
 *   1. User logs in via Supabase (email or OAuth)
 *   2. Supabase issues a JWT (access_token) and stores it in the session
 *   3. This client reads that token and attaches it as `Authorization: Bearer <token>`
 *   4. The FastAPI backend verifies it with `supabase.auth.get_user(token)`
 *
 * Required env vars:
 *   VITE_API_URL=http://localhost:8000   (your FastAPI server)
 */

import { supabase } from './supabase';

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Types — mirror the FastAPI schemas exactly
// ---------------------------------------------------------------------------

export interface Device {
  device_id: string | number;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TelemetryPayload {
  potentiometer_value: number;
  image_data?: string | null;
  timestamp?: string;
}

export interface TelemetryRecord {
  id: string;
  device_id: string | number;
  payload: TelemetryPayload;
  created_at: string;
}

interface UserTelemetryRow {
  telemetry_id: number;
  device_id: number;
  payload: TelemetryPayload;
  created_at?: string | number | null;
  score?: number;
}

export interface LLMRequest {
  prompt: string;
  model?: string;
}

export interface VLMRequest {
  prompt: string;
  image_url: string;
  model?: string;
}

export interface InferenceResponse {
  response: string;
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

// ---------------------------------------------------------------------------
// Core fetch helper — retrieves the live Supabase token every call
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Returns the current Supabase access token.
 * Throws if the user is not logged in.
 */
async function getToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new ApiError(401, 'Not authenticated — please log in');
  }
  return data.session.access_token;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (authenticated) {
    headers['Authorization'] = `Bearer ${await getToken()}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Devices — POST /devices/create  GET /devices/list  DELETE /devices/delete/:id
//           GET /devices/get/:id/data
// ---------------------------------------------------------------------------

export const devicesApi = {
  list(): Promise<Device[]> {
    return request<Device[]>('/devices/list');
  },

  create(device_id: number, name: string): Promise<Device> {
    return request<Device>('/devices/create', {
      method: 'POST',
      body: JSON.stringify({ device_id, name }),
    });
  },

  delete(device_id: string | number): Promise<{ message: string }> {
    return request<{ message: string }>(`/devices/delete/${device_id}`, {
      method: 'DELETE',
    });
  },

  getData(device_id: string | number): Promise<TelemetryRecord[]> {
    return request<TelemetryRecord[]>(`/devices/get/${device_id}/data`);
  },
};

function toIsoTimestamp(value: string | number | null | undefined): string {
  if (typeof value === 'number') return new Date(value * 1000).toISOString();
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return new Date().toISOString();
}

function normalizeUserTelemetryRow(row: UserTelemetryRow): TelemetryRecord {
  const created_at = toIsoTimestamp(row.created_at);
  const payload = row.payload ?? { potentiometer_value: 0, timestamp: created_at };
  return {
    id: String(row.telemetry_id),
    device_id: row.device_id,
    payload,
    created_at,
  };
}

export const usersDataApi = {
  async list(): Promise<TelemetryRecord[]> {
    const rows = await request<UserTelemetryRow[]>('/users/data');
    return rows.map(normalizeUserTelemetryRow);
  },
};

// ---------------------------------------------------------------------------
// Telemetry — POST /ingest/:device_id  (no auth required on this route)
// ---------------------------------------------------------------------------

export const telemetryApi = {
  /**
   * Ingest a telemetry reading for a device.
   * This endpoint has no auth guard in the backend, so we skip the token.
   */
  ingest(
    device_id: string | number,
    payload: TelemetryPayload,
  ): Promise<{ status: string; id: string }> {
    return request<{ status: string; id: string }>(
      `/ingest/${device_id}`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      false,   // no auth header — matches backend route
    );
  },
};

// ---------------------------------------------------------------------------
// Inference — POST /inference/llm   POST /inference/vlm
// ---------------------------------------------------------------------------

export const inferenceApi = {
  llm(prompt: string, model = 'gemini-1.5-flash-latest'): Promise<InferenceResponse> {
    return request<InferenceResponse>('/inference/llm', {
      method: 'POST',
      body: JSON.stringify({ prompt, model } satisfies LLMRequest),
    });
  },

  vlm(prompt: string, image_url: string, model = 'gemini-1.5-flash-latest'): Promise<InferenceResponse> {
    return request<InferenceResponse>('/inference/vlm', {
      method: 'POST',
      body: JSON.stringify({ prompt, image_url, model } satisfies VLMRequest),
    });
  },
};

// ---------------------------------------------------------------------------
// Leaderboard — GET /users/leaderboard
// ---------------------------------------------------------------------------

export const leaderboardApi = {
  list(limit = 20): Promise<LeaderboardEntry[]> {
    return request<LeaderboardEntry[]>(`/users/leaderboard?limit=${limit}`);
  },
};
