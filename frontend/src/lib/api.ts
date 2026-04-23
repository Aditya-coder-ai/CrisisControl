const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, signal } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Retrieve stored token for RBAC
  const token = localStorage.getItem('auth_token');
  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(
      `API Error: ${res.statusText}`,
      res.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

// ─── Incident Endpoints ─────────────────────────────────────
export interface Incident {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  reporter_id?: string;
  responder_id?: string;
  assigned_team?: string;
  external_agency?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  message: string;
  author: string;
  created_at: string;
}

export const incidents = {
  list: (params?: { status?: string; severity?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return request<Incident[]>(`/incidents${qs}`);
  },
  get: (id: string) => request<Incident>(`/incidents/${id}`),
  create: (data: Partial<Incident>) => request<Incident>('/incidents', { method: 'POST', body: data }),
  update: (id: string, data: Partial<Incident>) => request<Incident>(`/incidents/${id}`, { method: 'PATCH', body: data }),
  delete: (id: string) => request<void>(`/incidents/${id}`, { method: 'DELETE' }),
  getUpdates: (id: string) => request<IncidentUpdate[]>(`/incidents/${id}/updates`),
  addUpdate: (id: string, payload: { status: string; note: string; is_internal: boolean; }) =>
    request<IncidentUpdate>(`/incidents/${id}/updates`, { method: 'POST', body: payload }),
};

// ─── Auth Endpoints ──────────────────────────────────────────
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'guest' | 'staff' | 'responder' | 'admin';
  };
}

export const auth = {
  login: (credentials: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: credentials }),
  signup: (data: { name: string; email: string; password: string; role: string }) =>
    request<LoginResponse>('/auth/signup', { method: 'POST', body: data }),
  me: () =>
    request<{ id: string; name: string; role: string }>('/auth/me'),
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  },
};

// ─── Sync Endpoints (Offline-first) ─────────────────────────
export interface SyncPayload {
  batch_id: string;
  entries: Array<{
    uuid: string;
    type: string;
    data: unknown;
    timestamp: string;
  }>;
}

export const sync = {
  pushBatch: (payload: SyncPayload) =>
    request<{ accepted: number; conflicts: number }>('/sync/push', { method: 'POST', body: payload }),
  pullSince: (since: string) =>
    request<SyncPayload>(`/sync/pull?since=${encodeURIComponent(since)}`),
};

// ─── AI Classification Endpoints ────────────────────────────
export interface AIClassification {
  danger_score: number;
  severity: 'critical' | 'high' | 'moderate' | 'low';
  type: string;
  confidence: number;
  threat_keywords: string[];
  risk_factors: string[];
  priority: string;
  response_time: string;
}

export const ai = {
  classify: (description: string) =>
    request<AIClassification>('/ai/classify', { method: 'POST', body: { description } }),
};

export default { incidents, auth, sync, ai, ApiError };
