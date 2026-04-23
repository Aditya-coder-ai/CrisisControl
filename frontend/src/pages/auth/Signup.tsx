import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, User, Siren, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { auth } from '@/lib/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<'staff' | 'responder'>('staff');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await auth.signup({ name, email, password, role });
      // Store credentials
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user_role', res.user.role);
      localStorage.setItem('user_name', res.user.name);

      // Navigate using react-router (respects basename)
      const dest = res.user.role === 'responder' ? '/responder' : '/staff';
      navigate(dest);
    } catch (err: any) {
      // If backend is unreachable, fall back to mock auth for demo
      if (err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_name', name || 'Operator');
        const dest = role === 'responder' ? '/responder' : '/staff';
        navigate(dest);
        return;
      }

      const errorMsg = err?.data?.error || err?.message || 'Signup failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
                <p className="text-red-400/40 text-sm font-mono tracking-widest">PERSONNEL REGISTRATION</p>
              </div>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="flex items-start gap-4 p-4 bg-red-950/30 rounded-xl border border-red-500/20 animate-border-flash">
                <Siren className="text-red-500 w-5 h-5 mt-0.5 shrink-0 animate-urgency-pulse" />
                <div>
                  <h3 className="text-red-300 font-bold text-sm uppercase tracking-wider">Registration Protocol</h3>
                  <p className="text-red-400/40 text-xs mt-1">Create your operations account to access the emergency management system. All accounts require proper authorization and will be subject to role-based access controls.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-red-400/50 text-xs font-bold uppercase tracking-widest">Access Levels</h3>
                {[
                  { role: 'Staff / Dispatch', desc: 'Incident queue management, dispatch control, and coordination', icon: '◆' },
                  { role: 'First Responder', desc: 'Field operations, live map tracking, and tactical comms', icon: '◆' },
                ].map((item) => (
                  <div key={item.role} className="flex items-start gap-3 p-3 bg-red-950/20 rounded-lg border border-red-500/10">
                    <CheckCircle2 className="w-4 h-4 text-red-500/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-red-300/60 text-xs font-bold uppercase tracking-wider">{item.role}</p>
                      <p className="text-red-400/25 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
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

      {/* Right panel — signup form */}
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

          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Create Account</h2>
          <p className="text-red-400/40 mb-8 font-mono text-sm">Register for operations access</p>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-red-400 text-sm font-bold">{error}</span>
            </motion.div>
          )}

          {/* Role selector */}
          <div className="flex bg-red-950/30 rounded-xl p-1 mb-6 border border-red-500/15">
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                role === 'staff'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'text-red-400/40 hover:text-white'
              }`}
              id="signup-role-staff-btn"
            >
              Staff / Dispatch
            </button>
            <button
              type="button"
              onClick={() => setRole('responder')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 uppercase tracking-wider ${
                role === 'responder'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'text-red-400/40 hover:text-white'
              }`}
              id="signup-role-responder-btn"
            >
              First Responder
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs text-red-300/50 mb-2 block font-bold uppercase tracking-widest">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-red-950/20 border-red-500/15 text-white placeholder:text-red-400/20 focus:border-red-500 focus:ring-red-500/20"
                  id="signup-name"
                  required
                />
              </div>
            </div>

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
                  id="signup-email"
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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-red-950/20 border-red-500/15 text-white placeholder:text-red-400/20 focus:border-red-500 focus:ring-red-500/20"
                  id="signup-password"
                  required
                  minLength={6}
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

            <div>
              <label className="text-xs text-red-300/50 mb-2 block font-bold uppercase tracking-widest">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-red-950/20 border-red-500/15 text-white placeholder:text-red-400/20 focus:border-red-500 focus:ring-red-500/20"
                  id="signup-confirm-password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="emergency"
              className="w-full h-12 text-base uppercase tracking-wider font-black mt-2"
              disabled={loading}
              id="signup-submit-btn"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Register & Access System <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-red-500/10 flex items-center justify-between">
            <Link
              to="/"
              className="text-xs text-red-800/40 hover:text-red-400 transition-colors font-mono tracking-wider uppercase"
            >
              ← Back to hub
            </Link>
            <Link
              to="/login"
              className="text-xs text-red-500/50 hover:text-red-400 transition-colors font-mono tracking-wider uppercase flex items-center gap-1"
              id="login-link"
            >
              Already registered? Sign In <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
