import { useState, useEffect, useCallback } from 'react';
import api from './api';
import { useWebSocket } from './useWebSocket';

export function useIncidents() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lastMessage, isConnected } = useWebSocket(['incident_created', 'incident_updated', 'status_update']);

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.incidents.list();
      setIncidents(data || []);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Subscribe to Firestore real-time updates
  useEffect(() => {
    const unsubscribe = api.incidents.onRealtimeUpdates((data) => {
      setIncidents(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Also handle local event bus events (for cross-tab BroadcastChannel sync)
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.topic === 'incident_created' || lastMessage.topic === 'incident_updated') {
      // Firestore listener will handle the update, but we can do an optimistic update here
      const updatedIncident = lastMessage.payload;
      setIncidents((current) => {
        const exists = current.find((i) => i.id === updatedIncident.id);
        if (exists) {
          return current.map((i) => (i.id === updatedIncident.id ? updatedIncident : i));
        }
        return [updatedIncident, ...current];
      });
    }
  }, [lastMessage]);

  const stats = {
    activeCritical: incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length,
    inProgress: incidents.filter((i) => i.status === 'in_progress').length,
    resolved: incidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  };

  return {
    incidents,
    stats,
    isLoading,
    isConnected,
    refresh: fetchIncidents,
  };
}
