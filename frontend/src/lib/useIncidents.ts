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

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  // Process WebSocket events
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.topic === 'incident_created' || lastMessage.topic === 'incident_updated') {
      const newIncident = lastMessage.payload;
      setIncidents((current) => {
        const exists = current.find((i) => i.id === newIncident.id);
        if (exists) {
          return current.map((i) => (i.id === newIncident.id ? newIncident : i));
        }
        return [newIncident, ...current];
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
