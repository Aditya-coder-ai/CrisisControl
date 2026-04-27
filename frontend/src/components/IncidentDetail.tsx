import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, Activity, Flame, Users, AlertCircle, Building, Send, ChevronRight } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import api from '@/lib/api';
import { useWebSocket } from '@/lib/useWebSocket';

interface IncidentDetailProps {
  incidentId: string;
  onClose: () => void;
}

export default function IncidentDetail({ incidentId, onClose }: IncidentDetailProps) {
  const [incident, setIncident] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { lastMessage } = useWebSocket(['incident_updated', 'status_update']);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [incData, updatesData] = await Promise.all([
          api.incidents.get(incidentId),
          api.incidents.getUpdates(incidentId)
        ]);
        setIncident(incData);
        setUpdates(updatesData || []);
        if (incData) setNewStatus(incData.status);
      } catch (err) {
        console.error('Failed to load incident details', err);
      }
    }
    loadData();
  }, [incidentId]);

  // Handle WS updates
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.topic === 'incident_updated' && lastMessage.payload.id === incidentId) {
      setIncident(lastMessage.payload);
      setNewStatus(lastMessage.payload.status);
    } else if (lastMessage.topic === 'status_update' && lastMessage.payload.incident_id === incidentId) {
      setUpdates((prev) => [lastMessage.payload, ...prev]);
    }
  }, [lastMessage, incidentId]);

  const handleSubmitUpdate = async () => {
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await api.incidents.addUpdate(incidentId, {
        status: newStatus,
        note: note,
        is_internal: true
      });
      setNote('');
    } catch (err) {
      console.error('Failed to sumbit update', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!incident) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0a0505]/95 backdrop-blur-2xl border-l border-red-500/20 shadow-[-20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col pt-14"
    >
      <div className="scan-line absolute inset-0 pointer-events-none z-0" />
      
      {/* Header */}
      <div className="p-6 border-b border-red-500/10 shrink-0 relative z-10 bg-gradient-to-b from-red-950/20 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={incident.severity}>{incident.severity}</Badge>
              <span className="text-red-400/40 text-xs font-mono tracking-widest uppercase">{incident.id}</span>
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">{incident.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-red-950/30 text-red-500 hover:bg-red-500/20 hover:text-red-400 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-red-300/60 text-sm leading-relaxed mb-4">
          {incident.description}
        </p>

        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold font-mono tracking-wider bg-orange-500/10 border border-orange-500/20 text-orange-400 uppercase">
            <Flame className="w-3 h-3 inline mr-1" />{incident.type}
          </span>
          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold font-mono tracking-wider uppercase ${
            incident.status === 'resolved' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
            incident.status === 'dispatched' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
            incident.status === 'in_progress' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
            'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {incident.status}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-red-400/50 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {incident.location?.address || `${incident.location?.latitude?.toFixed(4) || '—'}°N, ${incident.location?.longitude?.toFixed(4) || '—'}°E`}
          </span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(incident.created_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Routing Info */}
      <div className="p-6 border-b border-red-500/10 shrink-0 relative z-10 bg-[#0d0606]">
        <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Routing Data
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-950/20 border border-red-500/15 rounded-xl p-3">
            <p className="text-[9px] text-red-400/50 uppercase tracking-widest mb-1.5">Internal Team</p>
            <p className="text-sm text-white font-bold flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-red-500" /> {incident.assigned_team || 'Pending'}
            </p>
          </div>
          <div className="bg-orange-950/20 border border-orange-500/15 rounded-xl p-3">
            <p className="text-[9px] text-orange-400/50 uppercase tracking-widest mb-1.5">External Agency</p>
            <p className="text-sm text-orange-400 font-bold flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> {incident.external_agency || 'None'}
            </p>
          </div>
        </div>

        {/* Tags */}
        {incident.tags && incident.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {incident.tags.map((tag: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-950/30 border border-red-500/10 text-red-300/50 font-mono">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 scrollbar-thin">
        <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Status Timeline
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-red-500/10">
          {updates.length === 0 && (
            <div className="text-red-400/30 text-sm font-mono tracking-wider italic text-center py-4">No updates yet</div>
          )}
          {updates.map((update, i) => (
            <div key={i} className="relative pl-8">
              <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[#0a0505] border-2 border-red-500 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500" />
              </div>
              <div className="bg-red-950/10 border border-red-500/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{update.status}</span>
                  <span className="text-[10px] text-red-400/40 font-mono tracking-widest">
                    {new Date(update.created_at).toLocaleTimeString()}
                  </span>
                </div>
                {(update.note || update.message) && (
                  <p className="text-sm text-red-300/60 leading-relaxed italic border-l-2 border-red-500/20 pl-3">"{update.note || update.message}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Update Form */}
      <div className="p-6 border-t border-red-500/10 bg-[#0d0606] relative z-10 shrink-0">
        <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Add Feedback
        </h3>
        <div className="space-y-3">
          <select 
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-[#0a0505] border border-red-500/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 appearance-none font-bold uppercase tracking-wider cursor-pointer"
          >
            <option value="reported">Reported</option>
            <option value="assessing">Assessing</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add internal tactical notes..."
            className="w-full bg-[#0a0505] border border-red-500/20 rounded-xl p-3 text-sm text-white placeholder:text-red-400/30 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none h-20"
          />
          <Button 
            className="w-full"
            disabled={submitting}
            onClick={handleSubmitUpdate}
          >
             {submitting ? 'Updating...' : 'Submit Update'} <Send className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
