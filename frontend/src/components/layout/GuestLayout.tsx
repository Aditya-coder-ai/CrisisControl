import { Link, useLocation } from 'react-router-dom';
import { Shield, Radio, ChevronLeft, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function GuestLayout({ children, title = "Emergency Assistance" }: GuestLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-[#0a0505] dark:to-[#0d0707] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white p-4 md:p-5 shadow-lg shadow-red-600/20 shrink-0 relative overflow-hidden">
        {/* Hazard stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-red-500 to-amber-400" />

        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            {!isHome && (
              <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            <Siren className="w-6 h-6 animate-urgency-pulse" />
            <h1 className="text-lg md:text-xl font-black tracking-wider uppercase">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20"
            )}>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-status-blink" />
              <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-white/80">ACTIVE</span>
            </div>
            <Radio className="w-4 h-4 text-white/30" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-[10px] text-red-400/30 dark:text-red-900/40 border-t border-red-200 dark:border-red-900/20 font-mono tracking-widest uppercase">
        Emergency Response System v1.0 &middot; Secure &middot; Encrypted
      </footer>
    </div>
  );
}
