import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Flame,
  Siren,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { useIncidents } from '@/lib/useIncidents';
import IncidentDetail from '@/components/IncidentDetail';

export default function StaffDashboard() {
  const { incidents, stats, isLoading, isConnected } = useIncidents();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const dashStats = [
    { label: 'Active Critical', count: stats.activeCritical, icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', ring: 'ring-red-500/20', pulse: stats.activeCritical > 0 },
    { label: 'In Progress', count: stats.inProgress, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', pulse: false },
    { label: 'Resolved Today', count: stats.resolved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', pulse: false },
    { label: 'Available Units', count: 12, icon: Users, color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20', pulse: false },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 relative min-h-full">
        {/* Connection status */}
        <div className="absolute top-0 right-8 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono text-white/50">{isConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
        </div>

        {/* Alert banner */}
        {stats.activeCritical > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/8 border-2 border-red-500/20 rounded-xl p-4 flex items-center gap-4 animate-border-flash"
          >
            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Siren className="w-5 h-5 text-red-500 animate-urgency-pulse" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-400 font-bold uppercase tracking-wider">
                {stats.activeCritical} Critical {stats.activeCritical === 1 ? 'Incident Requires' : 'Incidents Require'} Immediate Action
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20">
              View All
            </button>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dashStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`bg-[#0d0606] border border-red-500/10 p-5 rounded-2xl flex items-center justify-between group hover:border-red-500/20 transition-all ${
                stat.pulse ? 'animate-border-flash' : ''
              }`}
            >
              <div>
                <p className="text-[10px] text-red-400/30 font-bold uppercase tracking-[0.15em]">{stat.label}</p>
                <p className={`text-3xl font-black text-white mt-1 ${stat.pulse ? 'text-red-400' : ''}`}>{stat.count}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ring-1 ${stat.ring} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color} ${stat.pulse ? 'animate-urgency-pulse' : ''}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Incident Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-[#0d0606] border border-red-500/10 rounded-2xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="p-5 border-b border-red-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500/50" />
              <h2 className="text-base font-black text-white uppercase tracking-wider">Incident Queue</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-red-500/20" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-red-950/20 border border-red-500/10 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-red-500/40 text-white placeholder:text-red-400/15 w-48 transition-all focus:w-64 font-mono"
                  id="incident-search"
                />
              </div>
              <button className="flex items-center gap-2 text-xs text-red-400/30 hover:text-white transition px-3 py-2 border border-red-500/10 rounded-lg hover:bg-red-950/30 uppercase tracking-wider font-bold" id="incident-filter-btn">
                <Filter className="w-4 h-4" /> Filter
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0a0505] text-red-400/30 text-[10px] uppercase tracking-[0.15em] border-b border-red-500/10">
                  <th className="p-4 font-bold">ID</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Severity</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Assigned</th>
                  <th className="p-4 font-bold">Agency</th>
                  <th className="p-4 font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={7} className="p-8 text-center text-red-400/50 uppercase tracking-wider font-bold">Loading feed...</td></tr>
                )}
                {!isLoading && incidents.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-red-400/50 uppercase tracking-wider font-bold">No incidents</td></tr>
                )}
                {incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`border-b border-red-500/5 hover:bg-red-950/20 transition cursor-pointer group ${
                      inc.severity === 'critical' && inc.status !== 'resolved' ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-mono font-bold text-white text-sm">{inc.id}</span>
                    </td>
                    <td className="p-4 text-red-200/50 text-sm font-bold">{inc.type || 'Unknown'}</td>
                    <td className="p-4">
                      <Badge variant={inc.severity}>{inc.severity}</Badge>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 text-sm uppercase tracking-wider font-bold ${
                        inc.status === 'dispatched' ? 'text-blue-400' :
                        inc.status === 'in_progress' ? 'text-amber-400' :
                        inc.status === 'resolved' ? 'text-emerald-400' :
                        'text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          inc.status === 'dispatched' ? 'bg-blue-400' :
                          inc.status === 'in_progress' ? 'bg-amber-400 animate-pulse' :
                          inc.status === 'resolved' ? 'bg-emerald-400' :
                          'bg-red-500 animate-pulse'
                        }`} />
                        {inc.status || 'REPORTED'}
                      </span>
                    </td>
                    <td className="p-4 text-red-300/60 text-xs font-mono tracking-wider">{inc.assigned_team || '—'}</td>
                    <td className="p-4 text-orange-300/60 text-xs font-mono tracking-wider">{inc.external_agency || '—'}</td>
                    <td className="p-4 text-red-400/30 text-xs group-hover:text-red-300/50 transition-colors font-mono">
                      {new Date(inc.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      
      {/* Detail Slide Over */}
      <AnimatePresence>
        {selectedIncidentId && (
          <IncidentDetail 
            incidentId={selectedIncidentId} 
            onClose={() => setSelectedIncidentId(null)} 
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
