/**
 * Offline-first API layer — stores everything in localStorage.
 * Works on GitHub Pages without any backend server.
 * Provides the same interface as the original API module so all consumers
 * (Report, Dashboard, IncidentDetail, etc.) work without changes.
 */

import { eventBus } from './useWebSocket';
import { classifyDanger } from './aiClassifier';

// ─── Storage helpers ────────────────────────────────────────────
const INCIDENTS_KEY = 'crisis_incidents';
const UPDATES_KEY = 'crisis_updates';
const USERS_KEY = 'crisis_users';

function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return 'INC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateUpdateId(): string {
  return 'UPD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Seed some demo incidents if the store is empty
function seedDemoData() {
  const existing = readStore<Incident[]>(INCIDENTS_KEY, []);
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const demoIncidents: Incident[] = [
    {
      id: 'INC-DEMO01',
      type: 'Fire',
      title: 'Warehouse Fire — Sector 3',
      description: 'Large warehouse fire reported with heavy smoke. Multiple floors involved. Adjacent buildings at risk.',
      severity: 'critical',
      status: 'dispatched',
      location: { latitude: 19.076, longitude: 72.8777, address: '19.0760°N, 72.8777°E' },
      assigned_team: 'Fire Unit Alpha',
      external_agency: 'Fire Dept',
      tags: ['fire', 'warehouse', 'multi-floor'],
      created_at: new Date(Date.now() - 45 * 60000).toISOString(),
      updated_at: now,
    },
    {
      id: 'INC-DEMO02',
      type: 'Medical',
      title: 'Multi-Vehicle Collision',
      description: 'Major accident on highway involving 4 vehicles. At least 3 people injured, one unconscious.',
      severity: 'high',
      status: 'in_progress',
      location: { latitude: 28.6139, longitude: 77.209, address: '28.6139°N, 77.2090°E' },
      assigned_team: 'Medic-7',
      external_agency: 'Ambulance',
      tags: ['accident', 'highway', 'multiple-casualties'],
      created_at: new Date(Date.now() - 20 * 60000).toISOString(),
      updated_at: now,
    },
    {
      id: 'INC-DEMO03',
      type: 'Security',
      title: 'Suspicious Package — Mall',
      description: 'Unattended package found near main entrance of shopping mall. Area being evacuated.',
      severity: 'moderate',
      status: 'reported',
      location: { latitude: 12.9716, longitude: 77.5946, address: '12.9716°N, 77.5946°E' },
      assigned_team: 'Pending',
      external_agency: 'Police',
      tags: ['suspicious', 'evacuation'],
      created_at: new Date(Date.now() - 10 * 60000).toISOString(),
      updated_at: now,
    },
  ];

  writeStore(INCIDENTS_KEY, demoIncidents);

  // Seed some demo updates for the first incident
  const demoUpdates: IncidentUpdate[] = [
    {
      id: 'UPD-SEED01',
      incident_id: 'INC-DEMO01',
      message: 'First responders on scene. Fire contained to east wing.',
      author: 'Dispatch',
      status: 'dispatched',
      created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'UPD-SEED02',
      incident_id: 'INC-DEMO01',
      message: 'Additional fire units requested. Smoke visible from 2km.',
      author: 'Unit Alpha',
      status: 'in_progress',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
  ];
  writeStore(UPDATES_KEY, demoUpdates);
}

// Seed on module load
seedDemoData();

// ─── Types ──────────────────────────────────────────────────────
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
  status?: string;
  created_at: string;
}

// ─── Incident API (localStorage) ────────────────────────────────
export const incidents = {
  list: async (_params?: { status?: string; severity?: string }): Promise<Incident[]> => {
    const all = readStore<Incident[]>(INCIDENTS_KEY, []);
    // Sort by created_at descending (newest first)
    return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  get: async (id: string): Promise<Incident> => {
    const all = readStore<Incident[]>(INCIDENTS_KEY, []);
    const found = all.find(i => i.id === id);
    if (!found) throw new Error('Incident not found');
    return found;
  },

  create: async (data: Partial<Incident>): Promise<Incident> => {
    const all = readStore<Incident[]>(INCIDENTS_KEY, []);
    const now = new Date().toISOString();
    const newIncident: Incident = {
      id: generateId(),
      type: data.type || 'General',
      title: data.title || 'Emergency Report',
      description: data.description || '',
      severity: data.severity || 'high',
      status: data.status || 'reported',
      location: data.location || { latitude: 20.5937, longitude: 78.9629 },
      assigned_team: data.assigned_team,
      external_agency: data.external_agency,
      tags: data.tags,
      created_at: now,
      updated_at: now,
    };
    all.unshift(newIncident);
    writeStore(INCIDENTS_KEY, all);

    // Emit event so other components (Dashboard, Map) update in real time
    eventBus.emit('incident_created', newIncident);

    // Simulate dispatch after a short delay
    setTimeout(() => {
      const current = readStore<Incident[]>(INCIDENTS_KEY, []);
      const idx = current.findIndex(i => i.id === newIncident.id);
      if (idx !== -1 && current[idx].status === 'reported') {
        current[idx].status = 'dispatched';
        current[idx].assigned_team = current[idx].assigned_team || 'Response Unit-' + Math.ceil(Math.random() * 12);
        current[idx].updated_at = new Date().toISOString();
        writeStore(INCIDENTS_KEY, current);
        eventBus.emit('incident_updated', current[idx]);
      }
    }, 5000);

    return newIncident;
  },

  update: async (id: string, data: Partial<Incident>): Promise<Incident> => {
    const all = readStore<Incident[]>(INCIDENTS_KEY, []);
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Incident not found');
    all[idx] = { ...all[idx], ...data, updated_at: new Date().toISOString() };
    writeStore(INCIDENTS_KEY, all);
    eventBus.emit('incident_updated', all[idx]);
    return all[idx];
  },

  delete: async (id: string): Promise<void> => {
    const all = readStore<Incident[]>(INCIDENTS_KEY, []);
    writeStore(INCIDENTS_KEY, all.filter(i => i.id !== id));
  },

  getUpdates: async (id: string): Promise<IncidentUpdate[]> => {
    const all = readStore<IncidentUpdate[]>(UPDATES_KEY, []);
    return all
      .filter(u => u.incident_id === id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addUpdate: async (id: string, payload: { status: string; note: string; is_internal: boolean }): Promise<IncidentUpdate> => {
    const allUpdates = readStore<IncidentUpdate[]>(UPDATES_KEY, []);
    const newUpdate: IncidentUpdate = {
      id: generateUpdateId(),
      incident_id: id,
      message: payload.note,
      author: localStorage.getItem('user_name') || 'Operator',
      status: payload.status,
      created_at: new Date().toISOString(),
    };
    allUpdates.unshift(newUpdate);
    writeStore(UPDATES_KEY, allUpdates);

    // Also update the incident status
    const allIncidents = readStore<Incident[]>(INCIDENTS_KEY, []);
    const idx = allIncidents.findIndex(i => i.id === id);
    if (idx !== -1) {
      allIncidents[idx].status = payload.status;
      allIncidents[idx].updated_at = new Date().toISOString();
      writeStore(INCIDENTS_KEY, allIncidents);
      eventBus.emit('incident_updated', allIncidents[idx]);
    }

    eventBus.emit('status_update', newUpdate);
    return newUpdate;
  },
};

// ─── Auth API (localStorage) ────────────────────────────────────
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'guest' | 'staff' | 'responder' | 'admin';
  };
}

export const auth = {
  login: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
    // Strict credential mappings
    const demoAccounts: Record<string, { name: string; password: string; role: LoginResponse['user']['role'] }> = {
      'staff@emergency.gov': { name: 'Dispatch Control', password: 'staff123', role: 'staff' },
      'responder@emergency.gov': { name: 'Unit-04', password: 'resp123', role: 'responder' },
      'admin@emergency.gov': { name: 'Admin', password: 'admin123', role: 'admin' },
    };

    const account = demoAccounts[credentials.email];
    
    // Strict password verification
    if (!account || account.password !== credentials.password) {
      throw new ApiError('Invalid email or password', 401, { error: 'Invalid email or password' });
    }

    return {
      token: 'local-jwt-' + Date.now(),
      user: { id: 'user-' + Math.random().toString(36).substring(2, 6), name: account.name, role: account.role },
    };
  },

  signup: async (data: { name: string; email: string; password: string; role: string }): Promise<LoginResponse> => {
    const users = readStore<any[]>(USERS_KEY, []);
    const newUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 6),
      name: data.name,
      email: data.email,
      role: data.role as LoginResponse['user']['role'],
    };
    users.push(newUser);
    writeStore(USERS_KEY, users);

    return {
      token: 'local-jwt-' + Date.now(),
      user: { id: newUser.id, name: newUser.name, role: newUser.role },
    };
  },

  me: async (): Promise<{ id: string; name: string; role: string }> => {
    return {
      id: 'local-user',
      name: localStorage.getItem('user_name') || 'Operator',
      role: localStorage.getItem('user_role') || 'staff',
    };
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  },
};

// ─── Sync API (no-op for offline mode) ──────────────────────────
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
  pushBatch: async (_payload: SyncPayload) => ({ accepted: 0, conflicts: 0 }),
  pullSince: async (_since: string): Promise<SyncPayload> => ({ batch_id: '', entries: [] }),
};

// ─── AI Classification (delegates to client-side classifier) ────
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
  classify: async (description: string): Promise<AIClassification> => {
    return classifyDanger(description);
  },
};

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

export default { incidents, auth, sync, ai, ApiError };
