/**
 * API layer — uses Firebase Firestore for persistent cloud storage.
 * Incidents are stored in Firestore so they sync across all devices.
 * Auth remains local (demo mode) and AI classification runs client-side.
 */

import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { eventBus } from './useWebSocket';
import { classifyDanger } from './aiClassifier';

// ─── Storage helpers (for auth/users only) ──────────────────────
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

// ─── Firestore Collections ──────────────────────────────────────
const incidentsCol = collection(db, 'incidents');
const updatesCol = collection(db, 'incident_updates');

// ─── Seed Firestore with demo data if empty ─────────────────────
let seeded = false;
async function seedFirestoreIfEmpty() {
  if (seeded) return;
  seeded = true;
  
  try {
    const snapshot = await getDocs(incidentsCol);
    if (snapshot.size > 0) return; // Already has data

    const now = new Date();
    const demoIncidents = [
      {
        type: 'Fire',
        title: 'Warehouse Fire — Sector 3',
        description: 'Large warehouse fire reported with heavy smoke. Multiple floors involved. Adjacent buildings at risk.',
        severity: 'critical',
        status: 'dispatched',
        location: { latitude: 19.076, longitude: 72.8777, address: '19.0760°N, 72.8777°E' },
        assigned_team: 'Fire Unit Alpha',
        external_agency: 'Fire Dept',
        tags: ['fire', 'warehouse', 'multi-floor'],
        created_at: new Date(now.getTime() - 45 * 60000).toISOString(),
        updated_at: now.toISOString(),
      },
      {
        type: 'Medical',
        title: 'Multi-Vehicle Collision',
        description: 'Major accident on highway involving 4 vehicles. At least 3 people injured, one unconscious.',
        severity: 'high',
        status: 'in_progress',
        location: { latitude: 28.6139, longitude: 77.209, address: '28.6139°N, 77.2090°E' },
        assigned_team: 'Medic-7',
        external_agency: 'Ambulance',
        tags: ['accident', 'highway', 'multiple-casualties'],
        created_at: new Date(now.getTime() - 20 * 60000).toISOString(),
        updated_at: now.toISOString(),
      },
      {
        type: 'Security',
        title: 'Suspicious Package — Mall',
        description: 'Unattended package found near main entrance of shopping mall. Area being evacuated.',
        severity: 'moderate',
        status: 'reported',
        location: { latitude: 12.9716, longitude: 77.5946, address: '12.9716°N, 77.5946°E' },
        assigned_team: 'Pending',
        external_agency: 'Police',
        tags: ['suspicious', 'evacuation'],
        created_at: new Date(now.getTime() - 10 * 60000).toISOString(),
        updated_at: now.toISOString(),
      },
    ];

    for (const inc of demoIncidents) {
      await addDoc(incidentsCol, inc);
    }
    console.log('✅ Firestore seeded with demo incidents');
  } catch (err) {
    console.error('Seed failed:', err);
  }
}

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

// ─── Incident API (Firestore) ───────────────────────────────────
export const incidents = {
  list: async (_params?: { status?: string; severity?: string }): Promise<Incident[]> => {
    await seedFirestoreIfEmpty();
    const q = query(incidentsCol, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Incident));
  },

  get: async (id: string): Promise<Incident> => {
    const docRef = doc(db, 'incidents', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Incident not found');
    return { id: snap.id, ...snap.data() } as Incident;
  },

  create: async (data: Partial<Incident>): Promise<Incident> => {
    const now = new Date().toISOString();
    const newIncident = {
      type: data.type || 'General',
      title: data.title || 'Emergency Report',
      description: data.description || '',
      severity: data.severity || 'high',
      status: data.status || 'reported',
      location: data.location || { latitude: 20.5937, longitude: 78.9629 },
      assigned_team: data.assigned_team || '',
      external_agency: data.external_agency || '',
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
    };

    const docRef = await addDoc(incidentsCol, newIncident);
    const created: Incident = { id: docRef.id, ...newIncident } as Incident;

    // Emit event for cross-tab sync
    eventBus.emit('incident_created', created);

    // Simulate auto-dispatch after 5 seconds
    setTimeout(async () => {
      try {
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().status === 'reported') {
          const team = 'Response Unit-' + Math.ceil(Math.random() * 12);
          await updateDoc(docRef, {
            status: 'dispatched',
            assigned_team: team,
            updated_at: new Date().toISOString(),
          });
          eventBus.emit('incident_updated', { ...created, status: 'dispatched', assigned_team: team });
        }
      } catch (err) {
        console.error('Auto-dispatch failed:', err);
      }
    }, 5000);

    return created;
  },

  update: async (id: string, data: Partial<Incident>): Promise<Incident> => {
    const docRef = doc(db, 'incidents', id);
    const updateData = { ...data, updated_at: new Date().toISOString() };
    await updateDoc(docRef, updateData);
    const snap = await getDoc(docRef);
    const updated = { id: snap.id, ...snap.data() } as Incident;
    eventBus.emit('incident_updated', updated);
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    const docRef = doc(db, 'incidents', id);
    await deleteDoc(docRef);
  },

  getUpdates: async (id: string): Promise<IncidentUpdate[]> => {
    const q = query(updatesCol, where('incident_id', '==', id), orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as IncidentUpdate));
  },

  addUpdate: async (id: string, payload: { status: string; note: string; is_internal: boolean }): Promise<IncidentUpdate> => {
    const newUpdate = {
      incident_id: id,
      message: payload.note,
      author: localStorage.getItem('user_name') || 'Operator',
      status: payload.status,
      created_at: new Date().toISOString(),
    };

    const docRef = await addDoc(updatesCol, newUpdate);
    const created: IncidentUpdate = { id: docRef.id, ...newUpdate };

    // Also update the incident status in Firestore
    const incidentRef = doc(db, 'incidents', id);
    await updateDoc(incidentRef, {
      status: payload.status,
      updated_at: new Date().toISOString(),
    });

    const snap = await getDoc(incidentRef);
    if (snap.exists()) {
      eventBus.emit('incident_updated', { id: snap.id, ...snap.data() });
    }

    eventBus.emit('status_update', created);
    return created;
  },

  /** Subscribe to real-time Firestore updates — returns an unsubscribe function */
  onRealtimeUpdates: (callback: (incidents: Incident[]) => void) => {
    const q = query(incidentsCol, orderBy('created_at', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Incident));
      callback(data);
    });
  },
};

// ─── Auth API (local demo mode) ─────────────────────────────────
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

// ─── Sync API (no-op) ───────────────────────────────────────────
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

// ─── AI Classification (client-side) ────────────────────────────
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
