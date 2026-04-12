import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Radio,
  Info,
  Layers,
  AlertCircle,
  Crosshair,
  ChevronLeft,
  X,
  Clock,
  Users,
  MapPin,
  Flame,
  Activity,
  Siren,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useIncidents } from '@/lib/useIncidents';
import IncidentDetail from '@/components/IncidentDetail';

export default function ResponderMap() {
  const { incidents, isConnected } = useIncidents();
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Helper map for icons
  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'fire': return Flame;
      case 'medical': return Activity;
      default: return AlertCircle;
    }
  };

  const activeIncident = incidents.find(i => i.id === activeIncidentId);

  return (
    <div className="h-screen w-full bg-[#0a0505] flex flex-col relative overflow-hidden emergency-vignette">
      
      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[url('https://maps.wikimedia.org/osm-intl/13/4093/2724.png')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Red tint overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-red-950/30" />
      </div>

      {/* Scan line */}
      <div className="scan-line absolute inset-0 pointer-events-none z-50" />

      {/* Top HUD */}
      <div className="z-10 p-4 flex justify-between items-start pointer-events-none">
        {/* Unit Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <div className="bg-[#0a0505]/95 backdrop-blur-xl border border-red-500/20 p-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center border-2 border-red-400/30 shadow-lg shadow-red-500/20 animate-emergency-glow">
              <Radio className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-black tracking-[0.15em] text-sm uppercase flex items-center gap-2">
                UNIT-04 (ACTIVE)
                {isConnected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" title="Live Sync Active" />}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-status-blink" />
                <p className="text-red-400 text-xs font-mono tracking-widest">SECTOR 7-G • DEPLOYED</p>
              </div>
            </div>
          </div>

          <Link
            to="/staff"
            className="mt-3 inline-flex items-center gap-2 text-red-400/30 hover:text-white text-xs font-bold transition-colors bg-[#0a0505]/80 backdrop-blur px-3 py-1.5 rounded-lg border border-red-500/10 uppercase tracking-wider"
          >
            <ChevronLeft className="w-3 h-3" /> Dashboard
          </Link>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto flex flex-col gap-2"
        >
          <button
            onClick={() => setShowLayers(!showLayers)}
            className={`p-3 rounded-xl shadow-xl transition-all border ${
              showLayers
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-[#0a0505]/95 backdrop-blur-xl border-red-500/15 text-red-400/40 hover:text-white hover:border-red-500/30'
            }`}
            id="layers-toggle-btn"
          >
            <Layers className="w-5 h-5" />
          </button>
          <button className="bg-[#0a0505]/95 backdrop-blur-xl border border-red-500/15 p-3 rounded-xl text-red-400/40 hover:text-white hover:border-red-500/30 shadow-xl transition-all" id="crosshair-btn">
            <Crosshair className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Map Pins */}
      <div className="absolute inset-0 z-[5]">
        {incidents.filter(inc => inc.status !== 'resolved' && inc.status !== 'closed').map((pin, index) => {
          const Icon = getIcon(pin.type);
          // Scatter mock pins if lat/lon not dynamic enough
          const top = pin.location?.latitude ? `${(pin.location.latitude % 40) * 10}%` : `${30 + (index * 15)}%`;
          const left = pin.location?.longitude ? `${Math.abs(pin.location.longitude % 74) * 10}%` : `${20 + (index * 20)}%`;
          
          return (
            <div
              key={pin.id}
              className="absolute cursor-pointer"
              style={{ top, left }}
              onClick={() => setActiveIncidentId(activeIncidentId === pin.id ? null : pin.id)}
            >
              <div className="relative group">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-xl transition-transform group-hover:scale-110 ${
                  pin.severity === 'critical'
                    ? 'bg-red-600 border-red-400/50 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-urgency-pulse'
                    : pin.severity === 'high'
                    ? 'bg-amber-600 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-orange-500 border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                }`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
                {pin.severity === 'critical' && (
                  <>
                    <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-20" />
                    <div className="absolute -inset-2 border-2 border-red-500/30 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0a0505]/90 text-red-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                  {pin.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Incident Card */}
      <div className="z-10 mt-auto p-4 pointer-events-none">
        <AnimatePresence>
          {activeIncident && (
            <motion.div
              key={activeIncident.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`max-w-lg w-full bg-[#0a0505]/95 backdrop-blur-xl border rounded-2xl p-5 shadow-2xl pointer-events-auto ${
                activeIncident.severity === 'critical' ? 'border-red-500/30 animate-border-flash' : 'border-red-500/15'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={activeIncident.severity}>{activeIncident.severity}</Badge>
                    <span className="text-red-400/30 text-[10px] font-mono tracking-widest uppercase">{activeIncident.id}</span>
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">{activeIncident.title}</h3>
                </div>
                <button
                  onClick={() => setActiveIncidentId(null)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500/30 hover:text-red-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-red-300/40 text-sm mb-4 line-clamp-2">{activeIncident.description}</p>

              <div className="flex items-center gap-4 text-[10px] text-red-400/25 mb-4 font-mono tracking-wider uppercase">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {activeIncident.location?.address || 'Sector 4'}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(activeIncident.created_at).toLocaleTimeString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="emergency" className="rounded-xl font-black uppercase tracking-wider text-sm" id="navigate-btn">
                  <Siren className="w-4 h-4 mr-2" /> Respond
                </Button>
                <Button variant="outline" className="rounded-xl border-red-500/20 text-red-400/50 hover:text-white font-bold uppercase tracking-wider text-sm" onClick={() => setShowDetail(true)} id="details-btn">
                  <Info className="w-4 h-4 mr-2" /> View Intel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       {/* Detail Slide Over */}
       <AnimatePresence>
        {showDetail && activeIncidentId && (
          <IncidentDetail 
            incidentId={activeIncidentId} 
            onClose={() => setShowDetail(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
