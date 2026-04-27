import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  LayoutDashboard,
  Map,
  Zap,
  ArrowRight,
  Siren,
  Flame,
  Radio,
} from 'lucide-react';
import GuestReport from './pages/guest/Report';
import StaffDashboard from './pages/staff/Dashboard';
import ResponderMap from './pages/responder/Map';
import LoginPage from './pages/auth/Login';
import SignupPage from './pages/auth/Signup';
import TeamsPage from './pages/staff/Teams';
import AnalyticsPage from './pages/staff/Analytics';

const tierCards = [
  {
    path: '/guest',
    label: 'REPORT EMERGENCY',
    desc: 'Immediate incident reporting — voice, text, or photo capture for rapid dispatch.',
    icon: Siren,
    gradient: 'from-red-600 to-red-700',
    borderColor: 'border-red-500/40 hover:border-red-500',
    glow: 'hover:shadow-[0_0_40px_rgba(220,38,38,0.3)]',
    tier: 'TIER 1 — PUBLIC ACCESS',
    accentDot: 'bg-red-500',
  },
  {
    path: '/staff',
    label: 'COMMAND CENTER',
    desc: 'Live incident queue, dispatch control, and real-time coordination for operations staff.',
    icon: LayoutDashboard,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/30 hover:border-amber-500',
    glow: 'hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    tier: 'TIER 2 — STAFF ONLY',
    accentDot: 'bg-amber-500',
  },
  {
    path: '/responder',
    label: 'TACTICAL OPS',
    desc: 'Map-centric live operations for field units — routing, severity tracking, and comms.',
    icon: Map,
    gradient: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500/30 hover:border-orange-500',
    glow: 'hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]',
    tier: 'TIER 3 — RESPONDERS',
    accentDot: 'bg-orange-500',
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-[#0a0505] relative overflow-hidden">
      {/* Background hazard pattern */}
      <div className="absolute inset-0 hazard-stripe opacity-30" />
      {/* Red vignette glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-red-600/8 via-red-900/4 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-950/20 to-transparent" />
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          {/* Icon with emergency glow */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl animate-emergency-glow">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight uppercase">
            Emergency Response
          </h1>
          <p className="text-red-300/60 text-lg max-w-lg mx-auto font-medium tracking-wide">
            Multi-tier crisis management & rapid response coordination
          </p>

          {/* Status bar */}
          <div className="flex items-center justify-center gap-5 mt-8">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 px-4 py-2 rounded-full animate-border-flash">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-status-blink" />
              <span className="text-red-400 text-xs font-mono font-bold tracking-[0.2em]">ACTIVE ALERTS</span>
            </div>
            <div className="flex items-center gap-2 text-red-800/50 text-xs font-mono tracking-wider">
              <Radio className="w-3.5 h-3.5" />
              <span>ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2 text-red-800/50 text-xs font-mono tracking-wider">
              <Flame className="w-3.5 h-3.5" />
              <span>PRIORITY: HIGH</span>
            </div>
          </div>
        </motion.div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl w-full">
          {tierCards.map((card, i) => (
            <motion.div
              key={card.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
            >
              <Link
                to={card.path}
                className={`group block bg-[#110808]/90 border-2 ${card.borderColor} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl ${card.glow}`}
                id={`tier-card-${i + 1}`}
              >
                {/* Tier label */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${card.accentDot} animate-pulse`} />
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-400/50">
                      {card.tier}
                    </span>
                  </div>
                  <Zap className="w-4 h-4 text-red-900/40 group-hover:text-amber-400 transition-colors" />
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h2 className="text-lg font-black text-white mb-2 tracking-wide uppercase">
                  {card.label}
                </h2>
                <p className="text-sm text-red-300/40 mb-5 leading-relaxed">
                  {card.desc}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-bold text-red-500/60 group-hover:text-red-400 transition-colors uppercase tracking-wider">
                  <span>Enter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Auth link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12"
        >
          <Link
            to="/login"
            className="text-xs text-red-800/50 hover:text-red-400 transition-colors flex items-center gap-2 font-mono tracking-wider uppercase"
            id="auth-login-link"
          >
            <AlertTriangle className="w-3 h-3" />
            Authorized Personnel — Sign In
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/guest" element={<GuestReport />} />
        <Route path="/staff" element={
          <ProtectedRoute allowedRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="/staff/teams" element={
          <ProtectedRoute allowedRole="staff">
            <TeamsPage />
          </ProtectedRoute>
        } />
        <Route path="/staff/analytics" element={
          <ProtectedRoute allowedRole="staff">
            <AnalyticsPage />
          </ProtectedRoute>
        } />
        <Route path="/responder" element={
          <ProtectedRoute>
            <ResponderMap />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
