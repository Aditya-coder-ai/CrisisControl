import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  Flame,
  Shield,
  Users,
  Zap,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Dummy Analytics Data ───────────────────────────────────────
const summaryCards = [
  { label: 'Total Incidents', value: '1,247', change: '+12.3%', up: true, icon: AlertTriangle, color: 'red' },
  { label: 'Avg Response Time', value: '4.2 min', change: '-18.5%', up: false, icon: Clock, color: 'emerald' },
  { label: 'Active Responders', value: '38', change: '+5.1%', up: true, icon: Users, color: 'amber' },
  { label: 'Resolution Rate', value: '94.7%', change: '+2.8%', up: true, icon: Shield, color: 'blue' },
];

const incidentsByType = [
  { type: 'Fire / Blaze', count: 342, percent: 27.4, color: 'bg-orange-500' },
  { type: 'Medical Emergency', count: 289, percent: 23.2, color: 'bg-red-500' },
  { type: 'Traffic Accident', count: 198, percent: 15.9, color: 'bg-amber-500' },
  { type: 'Structural Collapse', count: 124, percent: 9.9, color: 'bg-rose-600' },
  { type: 'Hazmat / Chemical', count: 97, percent: 7.8, color: 'bg-purple-500' },
  { type: 'Natural Disaster', count: 82, percent: 6.6, color: 'bg-cyan-500' },
  { type: 'Security / Threat', count: 67, percent: 5.4, color: 'bg-pink-500' },
  { type: 'Other', count: 48, percent: 3.8, color: 'bg-slate-500' },
];

const severityBreakdown = [
  { severity: 'Critical', count: 187, percent: 15, color: 'from-red-600 to-red-800', textColor: 'text-red-400' },
  { severity: 'High', count: 356, percent: 28.5, color: 'from-orange-500 to-orange-700', textColor: 'text-orange-400' },
  { severity: 'Moderate', count: 412, percent: 33, color: 'from-amber-500 to-amber-700', textColor: 'text-amber-400' },
  { severity: 'Low', count: 292, percent: 23.5, color: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-400' },
];

const weeklyTrend = [
  { day: 'Mon', incidents: 42, resolved: 39 },
  { day: 'Tue', incidents: 38, resolved: 36 },
  { day: 'Wed', incidents: 55, resolved: 50 },
  { day: 'Thu', incidents: 47, resolved: 44 },
  { day: 'Fri', incidents: 62, resolved: 57 },
  { day: 'Sat', incidents: 35, resolved: 33 },
  { day: 'Sun', incidents: 28, resolved: 27 },
];

const topTeams = [
  { name: 'Fire Squad Alpha', resolved: 187, avgTime: '3.8 min', rating: 98 },
  { name: 'Medic Response 7', resolved: 156, avgTime: '4.1 min', rating: 96 },
  { name: 'Tactical Unit 04', resolved: 142, avgTime: '4.5 min', rating: 94 },
  { name: 'HazMat Delta', resolved: 89, avgTime: '5.2 min', rating: 91 },
  { name: 'Search & Rescue 3', resolved: 78, avgTime: '6.1 min', rating: 88 },
];

const recentActivity = [
  { time: '2 min ago', event: 'Critical fire alert dispatched to Fire Squad Alpha', type: 'critical' },
  { time: '8 min ago', event: 'Medic Response 7 resolved medical emergency at Sector 12', type: 'resolved' },
  { time: '15 min ago', event: 'New hazmat report filed — auto-classified as HIGH severity', type: 'new' },
  { time: '22 min ago', event: 'Tactical Unit 04 deployed to structural collapse site', type: 'deployed' },
  { time: '31 min ago', event: 'Traffic accident on Highway 9 downgraded to MODERATE', type: 'update' },
  { time: '45 min ago', event: 'Search & Rescue 3 cleared from flood zone — all safe', type: 'resolved' },
];

// ─── Simple Bar Chart Component ─────────────────────────────────
function MiniBarChart({ data }: { data: typeof weeklyTrend }) {
  const max = Math.max(...data.map(d => d.incidents));
  return (
    <div className="flex items-end gap-3 h-40 mt-4">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col items-center gap-1" style={{ height: '120px' }}>
            <div className="w-full flex gap-0.5 items-end h-full">
              {/* Incidents bar */}
              <div
                className="flex-1 bg-gradient-to-t from-red-700 to-red-500 rounded-t-sm opacity-80"
                style={{ height: `${(d.incidents / max) * 100}%` }}
              />
              {/* Resolved bar */}
              <div
                className="flex-1 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-sm opacity-80"
                style={{ height: `${(d.resolved / max) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] text-red-300/40 font-mono">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <DashboardLayout role="staff">
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <header>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-amber-500" />
            Analytics
          </h1>
          <p className="text-red-300/50 mt-1 font-medium">Incident statistics, team performance, and operational trends</p>
        </header>

        {/* ── Summary Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#110808]/90 border border-red-900/30 rounded-xl p-5 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${card.color}-500/10 border border-${card.color}-500/20 flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 text-${card.color}-400`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${card.up ? 'text-emerald-400' : 'text-emerald-400'}`}>
                  {card.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {card.change}
                </div>
              </div>
              <p className="text-2xl font-black text-white tracking-tight">{card.value}</p>
              <p className="text-xs text-red-300/40 font-medium mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weekly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-[#110808]/90 border border-red-900/30 rounded-xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-red-500" />
                Weekly Incident Trend
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-red-400/60">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Reported
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400/60">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Resolved
                </span>
              </div>
            </div>
            <MiniBarChart data={weeklyTrend} />
          </motion.div>

          {/* Severity Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#110808]/90 border border-red-900/30 rounded-xl p-6 shadow-xl"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-5">
              <Zap className="w-4 h-4 text-amber-500" />
              Severity Breakdown
            </h2>
            <div className="space-y-4">
              {severityBreakdown.map((s) => (
                <div key={s.severity}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${s.textColor}`}>{s.severity}</span>
                    <span className="text-xs text-red-300/40 font-mono">{s.count} ({s.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.percent}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Second Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Incidents by Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#110808]/90 border border-red-900/30 rounded-xl p-6 shadow-xl"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-5">
              <Flame className="w-4 h-4 text-orange-500" />
              Incidents by Type
            </h2>
            <div className="space-y-3">
              {incidentsByType.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span className="text-xs text-red-300/70 flex-1 truncate">{item.type}</span>
                  <span className="text-xs text-white font-bold font-mono w-10 text-right">{item.count}</span>
                  <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-[10px] text-red-300/30 font-mono w-12 text-right">{item.percent}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Performing Teams */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#110808]/90 border border-red-900/30 rounded-xl p-6 shadow-xl"
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Top Performing Teams
            </h2>
            <div className="overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-red-900/30">
                    <th className="text-left text-red-300/40 font-mono uppercase tracking-wider pb-3 pl-0">Team</th>
                    <th className="text-center text-red-300/40 font-mono uppercase tracking-wider pb-3">Resolved</th>
                    <th className="text-center text-red-300/40 font-mono uppercase tracking-wider pb-3">Avg Time</th>
                    <th className="text-right text-red-300/40 font-mono uppercase tracking-wider pb-3 pr-0">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {topTeams.map((team, i) => (
                    <tr key={team.name} className="border-b border-red-900/15 hover:bg-red-950/20 transition-colors">
                      <td className="py-3 pl-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-red-400/30 font-mono w-4">{i + 1}.</span>
                          <span className="text-white font-semibold">{team.name}</span>
                        </div>
                      </td>
                      <td className="text-center text-red-300/60 font-mono py-3">{team.resolved}</td>
                      <td className="text-center text-amber-400/70 font-mono py-3">{team.avgTime}</td>
                      <td className="text-right pr-0 py-3">
                        <span className={`font-mono font-bold ${team.rating >= 95 ? 'text-emerald-400' : team.rating >= 90 ? 'text-amber-400' : 'text-red-400'}`}>
                          {team.rating}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* ── Recent Activity Feed ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#110808]/90 border border-red-900/30 rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-red-500" />
            Recent Activity Feed
          </h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 group">
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                  item.type === 'critical' ? 'bg-red-500 animate-pulse' :
                  item.type === 'resolved' ? 'bg-emerald-500' :
                  item.type === 'new' ? 'bg-amber-500' :
                  item.type === 'deployed' ? 'bg-blue-500' :
                  'bg-slate-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-red-300/70 group-hover:text-white transition-colors">{item.event}</p>
                </div>
                <span className="text-[10px] text-red-300/30 font-mono shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
