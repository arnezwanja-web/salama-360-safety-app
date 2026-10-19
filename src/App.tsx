import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Shield, Warning, Siren, Phone, Flame, FirstAid, Clock, Check, MapPin } from "@phosphor-icons/react";
import Navbar from "./components/Navbar";
import SOSModal from "./components/SOSModal";
import IncidentMap from "./components/IncidentMap";
import IncidentReporting from "./components/IncidentReporting";
import ContactsAndProfile from "./components/ContactsAndProfile";
import type { SafetyStatus, Incident, EmergencyContact, MedicalProfile, IncidentStatus } from "./types";
import { STORAGE_KEYS, DEFAULT_INCIDENTS, DEFAULT_CONTACTS, DEFAULT_MEDICAL, EMERGENCY_HOTLINES, MAP_POINTS, SEVERITY_COLORS, SEVERITY_LABELS, SEVERITY_BG, CATEGORY_LABELS } from "./constants";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>(() => loadFromStorage(STORAGE_KEYS.safetyStatus, "safe" as SafetyStatus));
  const [incidents, setIncidents] = useState<Incident[]>(() => loadFromStorage(STORAGE_KEYS.incidents, DEFAULT_INCIDENTS));
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => loadFromStorage(STORAGE_KEYS.contacts, DEFAULT_CONTACTS));
  const [medical, setMedical] = useState<MedicalProfile>(() => loadFromStorage(STORAGE_KEYS.medical, DEFAULT_MEDICAL));
  const [sosOpen, setSosOpen] = useState(false);
  const [checkInActive, setCheckInActive] = useState(false);
  const [checkInTime, setCheckInTime] = useState(0);
  const [userCoords] = useState({ lat: 30.0444, lng: 31.2357 });

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.safetyStatus, JSON.stringify(safetyStatus)); }, [safetyStatus]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents)); }, [incidents]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.medical, JSON.stringify(medical)); }, [medical]);

  useEffect(() => {
    if (!checkInActive) return;
    const iv = setInterval(() => {
      setCheckInTime((t) => {
        if (t <= 1) {
          clearInterval(iv);
          setCheckInActive(false);
          setSafetyStatus("critical");
          setSosOpen(true);
          toast.error("Check-in expired! SOS triggered automatically.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [checkInActive]);

  const handleSOSActivate = useCallback((situation: string, coords: { lat: number; lng: number } | null) => {
    setSafetyStatus("critical");
    toast.error(`SOS ACTIVATED: ${situation}`, { description: coords ? `Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Location unavailable" });
  }, []);

  const handleAddIncident = (inc: Incident) => setIncidents((prev) => [inc, ...prev]);
  const handleUpvote = (id: string) => setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
  const handleUpdateStatus = (id: string, status: IncidentStatus) => setIncidents((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  const handleAddContact = (c: EmergencyContact) => setContacts((prev) => [...prev, c]);
  const handleUpdateContact = (c: EmergencyContact) => setContacts((prev) => prev.map((x) => x.id === c.id ? c : x));
  const handleDeleteContact = (id: string) => setContacts((prev) => prev.filter((x) => x.id !== id));
  const handleUpdateMedical = (m: MedicalProfile) => setMedical(m);

  const startCheckIn = (mins: number) => {
    setCheckInTime(mins * 60);
    setCheckInActive(true);
    setSafetyStatus("alert");
    toast.info(`Check-in timer set for ${mins} minutes`);
  };

  const cancelCheckIn = () => {
    setCheckInActive(false);
    setCheckInTime(0);
    setSafetyStatus("safe");
    toast.success("Check-in cancelled. You are safe.");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const recentAlerts = incidents.filter((i) => i.status === "active").slice(0, 3);

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-white font-sans">
      <Toaster richColors position="top-right" closeButton theme="dark" />
      <Navbar safetyStatus={safetyStatus} onSOS={() => setSosOpen(true)} activeTab={activeTab} onTabChange={setActiveTab} />

      <SOSModal open={sosOpen} onClose={() => { setSosOpen(false); if (safetyStatus === "critical") setSafetyStatus("safe"); }} onActivate={handleSOSActivate} contacts={contacts} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">Safety Status</h2>
                    <div className="flex gap-2">
                      {(["safe", "alert", "critical"] as SafetyStatus[]).map((s) => (
                        <button key={s} onClick={() => setSafetyStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          safetyStatus === s
                            ? s === "safe" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : s === "alert" ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-red-500/20 border-red-500/50 text-red-400"
                            : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                        }`}>
                          {s === "safe" ? "I Am Safe" : s === "alert" ? "Elevated" : "Active SOS"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {EMERGENCY_HOTLINES.map((h) => (
                      <motion.a
                        key={h.number}
                        href={`tel:${h.number}`}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 transition-colors"
                      >
                        {h.icon === "shield" && <Shield className="w-6 h-6 text-blue-400" weight="fill" />}
                        {h.icon === "heart" && <FirstAid className="w-6 h-6 text-emerald-400" weight="fill" />}
                        {h.icon === "flame" && <Flame className="w-6 h-6 text-orange-400" weight="fill" />}
                        {h.icon === "phone" && <Phone className="w-6 h-6 text-purple-400" weight="fill" />}
                        <span className="text-xs text-slate-300 font-medium">{h.label}</span>
                        <span className="text-sm font-bold text-white">{h.number}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Safety Check-in
                  </h3>
                  {checkInActive ? (
                    <div className="space-y-3">
                      <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-center py-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <span className="text-3xl font-bold text-amber-400 font-mono">{formatTime(checkInTime)}</span>
                        <p className="text-xs text-slate-400 mt-1">Time remaining</p>
                      </motion.div>
                      <button onClick={cancelCheckIn} className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
                        I am safe now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-400">Set a timer for your walk home. If you don't check in, SOS triggers automatically.</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 15, 30].map((m) => (
                          <button key={m} onClick={() => startCheckIn(m)} className="py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white hover:border-amber-500/50 font-medium">
                            {m} min
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Warning className="w-4 h-4 text-red-400" /> Recent Community Alerts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentAlerts.map((inc) => (
                    <div key={inc.id} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${inc.severity === "critical" ? "bg-red-500" : inc.severity === "high" ? "bg-orange-400" : "bg-amber-400"}`} />
                        <span className="text-xs text-white font-medium truncate">{inc.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {inc.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${SEVERITY_BG[inc.severity]} ${SEVERITY_COLORS[inc.severity]}`}>
                          {SEVERITY_LABELS[inc.severity]}
                        </span>
                        <span className="text-[9px] text-slate-500">{CATEGORY_LABELS[inc.category]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Active Incidents", value: incidents.filter((i) => i.status === "active").length, color: "text-red-400" },
                  { label: "Under Review", value: incidents.filter((i) => i.status === "under_review").length, color: "text-amber-400" },
                  { label: "Resolved", value: incidents.filter((i) => i.status === "resolved").length, color: "text-emerald-400" },
                  { label: "Trusted Contacts", value: contacts.length, color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-lg font-bold text-white mb-4">Incident Map</h2>
              <IncidentMap incidents={incidents} mapPoints={MAP_POINTS} userCoords={userCoords} />
            </motion.div>
          )}

          {activeTab === "reports" && (
            <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-lg font-bold text-white mb-4">Incident Log</h2>
              <IncidentReporting incidents={incidents} onAdd={handleAddIncident} onUpvote={handleUpvote} onUpdateStatus={handleUpdateStatus} />
            </motion.div>
          )}

          {activeTab === "contacts" && (
            <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-lg font-bold text-white mb-4">Contacts & Medical ID</h2>
              <ContactsAndProfile
                contacts={contacts}
                medical={medical}
                onAddContact={handleAddContact}
                onUpdateContact={handleUpdateContact}
                onDeleteContact={handleDeleteContact}
                onUpdateMedical={handleUpdateMedical}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-800 py-4 text-center">
        <p className="text-xs text-slate-500">Salama 360 Personal Safety Platform</p>
      </footer>
    </div>
  );
}
