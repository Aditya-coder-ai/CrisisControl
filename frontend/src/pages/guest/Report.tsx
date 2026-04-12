import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MapPin, AlertCircle, Phone, Send, Loader2, Camera, FileText, CheckCircle2, Siren } from 'lucide-react';
import GuestLayout from '@/components/layout/GuestLayout';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { useWebSocket } from '@/lib/useWebSocket';

export default function GuestReport() {
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeInput, setActiveInput] = useState<'voice' | 'text' | 'photo' | null>(null);
  const [textReport, setTextReport] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [liveStatus, setLiveStatus] = useState('reported');
  const { lastMessage, isConnected } = useWebSocket(['incident_updated']);

  const handleReport = async () => {
    setSubmitting(true);
    try {
      // Determine pseudo type/severity based on input for demo purposes
      let type = 'Medical';
      if (textReport.toLowerCase().includes('fire')) type = 'Fire';
      if (textReport.toLowerCase().includes('fight') || textReport.toLowerCase().includes('gun')) type = 'Security';
      
      const res = await api.incidents.create({
        type: type,
        title: 'Guest Report',
        description: textReport || 'Voice/Photo evidence submitted.',
        severity: 'high',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Sector 4',
        },
        status: 'reported'
      });
      // @ts-ignore
      setIncidentId(res.id || 'INC-PENDING');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted && lastMessage && lastMessage.topic === 'incident_updated' && lastMessage.payload.id === incidentId) {
      setLiveStatus(lastMessage.payload.status);
    }
  }, [submitted, lastMessage, incidentId]);

  if (submitted) {
    return (
      <GuestLayout title="Report Submitted">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 bg-emerald-500/15 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-emerald-500/20 relative">
               {isConnected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />}
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Help Is Coming</h2>
            <p className="text-slate-500 dark:text-red-300/40 text-lg mb-4">
              Your emergency report has been received. Responders are being dispatched to your location.
            </p>
            
            <div className="bg-[#0a0505] border-2 border-red-500/20 rounded-2xl p-6 mb-6">
              <h3 className="text-red-500 font-black uppercase text-sm mb-4 flex items-center justify-center gap-2">
                <Siren className="w-4 h-4" /> Live Status
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${liveStatus === 'reported' ? 'bg-red-500 animate-pulse ring-4 ring-red-500/20' : 'bg-red-500/30'}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${liveStatus === 'reported' ? 'text-white' : 'text-red-400/40'}`}>Report Received</span>
                </div>
                <div className="w-0.5 h-6 bg-red-500/20 ml-[7px]" />
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${liveStatus === 'dispatched' ? 'bg-amber-500 animate-pulse ring-4 ring-amber-500/20' : 'bg-red-500/30'}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${liveStatus === 'dispatched' ? 'text-white' : 'text-red-400/40'}`}>Units Dispatched</span>
                </div>
                <div className="w-0.5 h-6 bg-red-500/20 ml-[7px]" />
                <div className="flex items-center gap-4">
                   <div className={`w-4 h-4 rounded-full ${liveStatus === 'resolved' ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-red-500/30'}`} />
                  <span className={`text-sm font-bold uppercase tracking-wider ${liveStatus === 'resolved' ? 'text-white' : 'text-red-400/40'}`}>Situation Resolved</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => { setSubmitted(false); setTextReport(''); setActiveInput(null); setLiveStatus('reported'); }}
              variant="outline"
              size="lg"
              className="border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 uppercase tracking-wider font-bold"
            >
              Submit Another Report
            </Button>
          </motion.div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout>
      <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center space-y-8 max-w-2xl mx-auto w-full">
        
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-wide">
            What is happening?
          </h2>
          <p className="text-lg text-red-400/50 font-medium">
            Choose how to report the emergency
          </p>
        </motion.div>

        {/* Input Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 w-full"
        >
          {[
            { id: 'voice' as const, icon: Mic, label: 'Voice', activeClass: 'border-red-500 bg-red-50 dark:bg-red-500/10', iconActive: 'text-red-500' },
            { id: 'text' as const, icon: FileText, label: 'Text', activeClass: 'border-amber-500 bg-amber-50 dark:bg-amber-500/10', iconActive: 'text-amber-500' },
            { id: 'photo' as const, icon: Camera, label: 'Photo', activeClass: 'border-orange-500 bg-orange-50 dark:bg-orange-500/10', iconActive: 'text-orange-500' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveInput(activeInput === mode.id ? null : mode.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                activeInput === mode.id
                  ? `${mode.activeClass} shadow-lg`
                  : 'border-slate-200 dark:border-red-500/15 hover:border-slate-300 dark:hover:border-red-500/30 bg-white dark:bg-red-950/20'
              }`}
              id={`input-mode-${mode.id}`}
            >
              <mode.icon className={`w-8 h-8 ${
                activeInput === mode.id ? mode.iconActive : 'text-slate-400 dark:text-red-400/30'
              }`} />
              <span className={`text-sm font-bold uppercase tracking-wider ${
                activeInput === mode.id ? mode.iconActive : 'text-slate-500 dark:text-red-400/30'
              }`}>
                {mode.label}
              </span>
            </button>
          ))}
        </motion.div>
        
        {/* Active Input Area */}
        <AnimatePresence mode="wait">
          {activeInput === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center space-y-4"
            >
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`w-36 h-36 mx-auto rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                  isRecording 
                    ? 'bg-red-600 ring-8 ring-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-urgency-pulse' 
                    : 'bg-white dark:bg-red-950/30 hover:scale-105 border-4 border-red-500'
                }`}
                id="voice-record-btn"
              >
                <Mic className={`w-14 h-14 ${isRecording ? 'text-white' : 'text-red-500'}`} />
              </button>
              <p className={`text-sm font-bold uppercase tracking-wider ${isRecording ? 'text-red-500 animate-urgency-pulse' : 'text-red-400/40'}`}>
                {isRecording ? '● Recording — Tap to stop' : 'Tap to start recording'}
              </p>
            </motion.div>
          )}

          {activeInput === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <textarea
                value={textReport}
                onChange={(e) => setTextReport(e.target.value)}
                placeholder="Describe the emergency situation in detail..."
                className="w-full h-40 p-4 bg-white dark:bg-red-950/20 border-2 border-slate-200 dark:border-red-500/20 rounded-2xl text-slate-800 dark:text-white placeholder:text-red-400/20 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none text-lg transition-all"
                id="text-report-input"
              />
            </motion.div>
          )}

          {activeInput === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <div className="border-2 border-dashed border-orange-300 dark:border-orange-500/20 rounded-2xl p-12 text-center bg-white dark:bg-orange-950/10 hover:border-orange-500 transition-colors cursor-pointer">
                <Camera className="w-12 h-12 text-orange-400/50 mx-auto mb-3" />
                <p className="text-orange-500/70 font-bold uppercase tracking-wider text-sm">Tap to capture or upload</p>
                <p className="text-orange-400/30 text-xs mt-1 font-mono">JPG, PNG — MAX 10MB</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-white dark:bg-red-950/20 p-5 rounded-2xl shadow-lg border-2 border-slate-100 dark:border-red-500/15"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider text-sm">
              <MapPin className="w-5 h-5 text-red-500" /> Location Detected
            </h3>
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] px-3 py-1 rounded-full font-bold font-mono tracking-widest uppercase">
              ● GPS LOCK
            </span>
          </div>
          <div className="h-36 bg-slate-100 dark:bg-red-950/30 rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/13/4093/2724.png')] bg-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg animate-bounce" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer CTA */}
      <div className="p-4 md:p-5 bg-white/90 dark:bg-[#0a0505]/90 backdrop-blur-xl border-t-2 border-red-200 dark:border-red-500/20 sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto flex gap-3">
          <a
            href="tel:911"
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-red-500 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors uppercase tracking-wider"
            id="call-911-btn"
          >
            <Phone className="w-5 h-5" />
            <span className="hidden sm:inline">911</span>
          </a>
          <Button
            onClick={handleReport}
            disabled={submitting}
            variant="emergency"
            size="xl"
            className="flex-1 text-lg py-5 rounded-2xl uppercase tracking-wider font-black"
            id="send-help-btn"
          >
            {submitting ? (
              <span className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin" /> Dispatching...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Siren className="w-6 h-6" /> SEND HELP NOW
              </span>
            )}
          </Button>
        </div>
      </div>
    </GuestLayout>
  );
}
