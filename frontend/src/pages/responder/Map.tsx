import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Info,
  Layers,
  AlertCircle,
  Crosshair,
  ChevronLeft,
  X,
  Clock,
  MapPin,
  Flame,
  Activity,
  Siren,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useIncidents } from '@/lib/useIncidents';
import IncidentDetail from '@/components/IncidentDetail';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createSeverityIcon(severity: string) {
  const color = severity === 'critical' ? '#dc2626' : severity === 'high' ? '#d97706' : '#ea580c';
  return L.divIcon({
    className: 'custom-severity-marker',
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50%;
      background: ${color}; border: 3px solid rgba(255,255,255,0.8);
      box-shadow: 0 0 20px ${color}80, 0 0 40px ${color}40;
      display: flex; align-items: center; justify-content: center;
    "><div style="width:10px;height:10px;background:white;border-radius:50%;"></div></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

const tileUrls: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export default function ResponderMap() {
  const { incidents, isConnected } = useIncidents();
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'standard'>('dark');

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.LayerGroup>(L.layerGroup());

  const activeIncident = incidents.find(i => i.id === activeIncidentId);
  const activeIncidents = incidents.filter(inc => inc.status !== 'resolved' && inc.status !== 'closed');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    tileLayerRef.current = L.tileLayer(tileUrls[mapStyle]).addTo(map);
    markersRef.current.addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer when style changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }
    tileLayerRef.current = L.tileLayer(tileUrls[mapStyle]).addTo(mapRef.current);
  }, [mapStyle]);

  // Update markers when incidents change
  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.clearLayers();

    activeIncidents.forEach((inc) => {
      const lat = inc.location?.latitude || 20.5937 + Math.random() * 10;
      const lng = inc.location?.longitude || 73 + Math.random() * 10;

      const marker = L.marker([lat, lng], { icon: createSeverityIcon(inc.severity) });
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px">
          <strong style="font-size:14px;text-transform:uppercase">${inc.title}</strong><br/>
          <span style="font-size:11px;color:#888">${inc.type} • ${inc.severity}</span><br/>
          <span style="font-size:11px">${inc.location?.address || 'Unknown location'}</span>
        </div>
      `);
      marker.on('click', () => {
        setActiveIncidentId(prev => prev === inc.id ? null : inc.id);
      });
      markersRef.current.addLayer(marker);
    });
  }, [activeIncidents]);

  // Fly to active incident
  useEffect(() => {
    if (!mapRef.current || !activeIncident?.location?.latitude) return;
    mapRef.current.flyTo(
      [activeIncident.location.latitude, activeIncident.location.longitude],
      14,
      { duration: 1.2 }
    );
  }, [activeIncidentId]);

  return (
    <div className="h-screen w-full bg-[#0a0505] flex flex-col relative overflow-hidden">

      {/* Full-screen Leaflet Map */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Scan line overlay */}
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

          <AnimatePresence>
            {showLayers && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#0a0505]/95 backdrop-blur-xl border border-red-500/20 rounded-xl p-2 flex flex-col gap-1"
              >
                {(['dark', 'satellite', 'standard'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => { setMapStyle(style); setShowLayers(false); }}
                    className={`px-3 py-2 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase transition-all ${
                      mapStyle === style
                        ? 'bg-red-600 text-white'
                        : 'text-red-400/40 hover:text-white hover:bg-red-500/10'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <button className="bg-[#0a0505]/95 backdrop-blur-xl border border-red-500/15 p-3 rounded-xl text-red-400/40 hover:text-white hover:border-red-500/30 shadow-xl transition-all" id="crosshair-btn">
            <Crosshair className="w-5 h-5" />
          </button>
        </motion.div>
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

      {/* Custom CSS */}
      <style>{`
        .custom-severity-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #0a0505 !important;
        }
      `}</style>
    </div>
  );
}
