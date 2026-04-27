import { motion } from 'framer-motion';
import { Phone, Mail, BadgeCheck, Users, Shield, Radio } from 'lucide-react';

const DUMMY_TEAMS = [
  {
    id: 'U-04',
    name: 'Tactical Unit 04',
    type: 'Responder Team',
    status: 'Deployed',
    members: [
      { id: 'M-101', name: 'Alex Vance', position: 'Team Lead', phone: '+1 (555) 019-2831', email: 'a.vance@emergency.gov' },
      { id: 'M-102', name: 'Sarah Chen', position: 'Paramedic', phone: '+1 (555) 019-2832', email: 's.chen@emergency.gov' },
      { id: 'M-103', name: 'Marcus Cole', position: 'Heavy Rescue Specialist', phone: '+1 (555) 019-2833', email: 'm.cole@emergency.gov' },
    ]
  },
  {
    id: 'M-07',
    name: 'Medic Response 7',
    type: 'Medical Team',
    status: 'Standby',
    members: [
      { id: 'M-201', name: 'Dr. Elena Rostova', position: 'Field Physician', phone: '+1 (555) 021-9941', email: 'e.rostova@emergency.gov' },
      { id: 'M-202', name: 'James Wilson', position: 'EMT', phone: '+1 (555) 021-9942', email: 'j.wilson@emergency.gov' },
    ]
  },
  {
    id: 'F-12',
    name: 'Fire Squad Alpha',
    type: 'Fire & Rescue',
    status: 'Available',
    members: [
      { id: 'M-301', name: 'Chief Robert Kinkaid', position: 'Squad Commander', phone: '+1 (555) 033-1121', email: 'r.kinkaid@emergency.gov' },
      { id: 'M-302', name: 'Luis Garcia', position: 'Firefighter / Engineer', phone: '+1 (555) 033-1122', email: 'l.garcia@emergency.gov' },
      { id: 'M-303', name: 'Emma Frost', position: 'Hazmat Specialist', phone: '+1 (555) 033-1123', email: 'e.frost@emergency.gov' },
      { id: 'M-304', name: 'David Kim', position: 'Firefighter', phone: '+1 (555) 033-1124', email: 'd.kim@emergency.gov' },
    ]
  }
];

export default function TeamsPage() {
  return (
    <div className="p-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-amber-500" />
              Teams & Units
            </h1>
            <p className="text-red-300/50 mt-1 font-medium">Directory of all active responder units and personnel</p>
          </div>
        </header>

        <div className="grid gap-6">
          {DUMMY_TEAMS.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#110808]/90 border border-red-900/30 rounded-xl overflow-hidden shadow-2xl"
            >
              {/* Team Header */}
              <div className="border-b border-red-900/30 bg-red-950/20 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-800 to-red-950 border border-red-700/50 flex items-center justify-center shadow-inner">
                    <Shield className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white tracking-wide uppercase">{team.name}</h2>
                      <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider">
                        {team.id}
                      </span>
                    </div>
                    <p className="text-sm text-red-300/60 font-medium">{team.type}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2.5 py-1 rounded-sm font-mono font-bold tracking-widest uppercase border flex items-center gap-1.5
                    ${team.status === 'Deployed' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : ''}
                    ${team.status === 'Standby' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : ''}
                    ${team.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}
                  `}>
                    <Radio className="w-3 h-3" />
                    {team.status}
                  </span>
                </div>
              </div>

              {/* Members List */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="bg-black/40 border border-red-900/20 rounded-lg p-4 hover:border-red-900/50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold tracking-wide flex items-center gap-2">
                            {member.name}
                            {member.position.includes('Lead') || member.position.includes('Commander') ? (
                              <BadgeCheck className="w-4 h-4 text-amber-500" />
                            ) : null}
                          </h3>
                          <p className="text-xs text-red-300/50 uppercase tracking-wider font-mono mt-0.5">{member.position}</p>
                        </div>
                        <span className="text-[10px] text-red-400/40 font-mono">{member.id}</span>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex items-center gap-2 text-sm text-red-300/70">
                          <Phone className="w-3.5 h-3.5 text-red-500/70" />
                          <span className="font-mono text-xs">{member.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-red-300/70">
                          <Mail className="w-3.5 h-3.5 text-red-500/70" />
                          <span className="text-xs">{member.email}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
    </div>
  );
}
