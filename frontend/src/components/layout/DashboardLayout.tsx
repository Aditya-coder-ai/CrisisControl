import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Map as MapIcon,
  Bell,
  Settings,
  LogOut,
  AlertTriangle,
  Activity,
  ChevronRight,
  Siren,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Active Incidents', icon: LayoutDashboard, path: '/staff', badge: '3' },
  { label: 'Teams & Units', icon: Users, path: '/staff/teams' },
  { label: 'Live Map', icon: MapIcon, path: '/responder' },
  { label: 'Analytics', icon: Activity, path: '/staff/analytics' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#0a0505] text-slate-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "border-r border-red-500/10 bg-gradient-to-b from-[#0d0606] to-[#0a0505] flex flex-col transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-red-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20 animate-emergency-glow">
            <Siren className="text-white w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-black text-white truncate uppercase tracking-wider">Command Ctr</h1>
              <p className="text-[9px] text-red-500/30 font-mono tracking-[0.2em]">SECURE • ACTIVE</p>
            </div>
          )}
        </div>

        {/* Urgency indicator */}
        {!collapsed && (
          <div className="mx-3 mt-3 p-2.5 bg-red-950/30 border border-red-500/15 rounded-lg animate-border-flash">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-urgency-pulse" />
              <span className="text-[10px] font-mono text-red-400/60 tracking-wider font-bold">3 CRITICAL ALERTS</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 pt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative",
                  active
                    ? "bg-red-600/15 text-red-400 shadow-[inset_0_0_20px_rgba(220,38,38,0.05)]"
                    : "text-red-300/30 hover:bg-red-950/30 hover:text-white"
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-red-500 rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5 shrink-0", active && "text-red-400")} />
                {!collapsed && (
                  <>
                    <span className="truncate text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-urgency-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-red-500/10 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/20 hover:bg-red-950/30 hover:text-white transition-all text-sm">
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/20 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Exit</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 border-t border-red-500/10 text-red-900/30 hover:text-white hover:bg-red-950/30 transition-colors flex justify-center"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", collapsed ? "" : "rotate-180")} />
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Scan line effect */}
        <div className="scan-line absolute inset-0 pointer-events-none z-50" />

        {/* Top bar */}
        <header className="h-14 border-b border-red-500/10 bg-[#0a0505]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-white font-black uppercase tracking-wider text-xs">Dispatch Console</span>
              <span className="mx-2 text-red-900/30">|</span>
              <span className="font-mono text-[11px] text-red-400/30 tracking-wider">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-red-400/30 hover:text-red-400 transition-colors rounded-lg hover:bg-red-950/30" id="notifications-btn">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0a0505] animate-status-blink" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 border-2 border-red-900/50 shadow-lg" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
