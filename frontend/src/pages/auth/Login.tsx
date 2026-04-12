import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Siren } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'staff' | 'responder'>('staff');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
      localStorage.setItem('user_role', role);
      setLoading(false);
      window.location.href = role === 'staff' ? '/staff' : '/responder';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0505] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0505] via-red-950/30 to-[#0a0505]" />
        <div className="absolute inset-0 hazard-stripe opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-900/10 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center p-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-2xl animate-emergency-glow">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-wide">Emergency Ops</h1>
                <p className="text-red-400/40 text-sm font-mono tracking-widest">RESTRICTED ACCESS</p>
              </div>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="flex items-start gap-4 p-4 bg-red-950/30 rounded-xl border border-red-500/20 animate-border-flash">
                <Siren className="text-red-500 w-5 h-5 mt-0.5 shrink-0 animate-urgency-pulse" />
                <div>
                  <h3 className="text-red-300 font-bold text-sm uppercase tracking-wider">Authorized Access Only</h3>
                  <p className="text-red-400/40 text-xs mt-1">This portal is restricted to authorized emergency personnel. All sessions are monitored, recorded, and audited in compliance with federal regulations.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-amber-950/20 rounded-xl border border-amber-500/15">
                <AlertTriangle className="text-amber-500 w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-amber-300/80 font-bold text-sm uppercase tracking-wider">Active Incidents</h3>
                  <p className="text-amber-400/30 text-xs mt-1">There are currently <span className="text-amber-400 font-bold">3 critical</span> and <span className="text-amber-400 font-bold">8 active</span> incidents requiring attention.</p>
                </div>
              </div>

              <div className="text-xs text-red-900/40 font-mono space-y-1 tracking-wider">
                <p>╔════════════════════════════════════════════╗</p>
                <p>║ &nbsp;AES-256 &middot; TLS 1.3 &middot; ZERO-TRUST NETWORK &nbsp;║</p>
                <p>╚════════════════════════════════════════════╝</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center animate-emergency-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-wide">Emergency Ops</h1>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Authenticate</h2>
          <p className="text-red-400/40 mb-8 font-mono text-sm">Sign in to access operations</p>

          {/* Role selector */}
          <div className="flex bg-red-950/30 rounded-xl p-1 mb-6 border border-red-500/15">
            <button
              onClick={() => setRole('staff')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                role === 'staff'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'text-red-400/40 hover:text-white'
              }`}
              id="role-staff-btn"
            >
              Staff / Dispatch
            </button>
            <button
              onClick={() => setRole('responder')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                role === 'responder'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'text-red-400/40 hover:text-white'
              }`}
              id="role-responder-btn"
            >
              First Responder
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs text-red-300/50 mb-2 block font-bold uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30" />
                <Input
                  type="email"
                  placeholder="operator@emergency.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-red-950/20 border-red-500/15 text-white placeholder:text-red-400/20 focus:border-red-500 focus:ring-red-500/20"
                  id="login-email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-red-300/50 mb-2 block font-bold uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-red-950/20 border-red-500/15 text-white placeholder:text-red-400/20 focus:border-red-500 focus:ring-red-500/20"
                  id="login-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="emergency"
              className="w-full h-12 text-base uppercase tracking-wider font-black"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Access System <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-red-500/10 text-center">
            <Link
              to="/"
              className="text-xs text-red-800/40 hover:text-red-400 transition-colors font-mono tracking-wider uppercase"
            >
              ← Back to hub
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
