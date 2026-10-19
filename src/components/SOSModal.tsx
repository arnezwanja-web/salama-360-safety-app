import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Siren, X, MapPin, Phone, Radio } from "@phosphor-icons/react";
import { SITUATION_TAGS } from "../constants";
import type { EmergencyContact } from "../types";

interface SOSModalProps {
  open: boolean;
  onClose: () => void;
  onActivate: (situation: string, coords: { lat: number; lng: number } | null) => void;
  contacts: EmergencyContact[];
}

export default function SOSModal({ open, onClose, onActivate, contacts }: SOSModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [phase, setPhase] = useState<"idle" | "countdown" | "active">("idle");
  const [situation, setSituation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sirenOn, setSirenOn] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setCountdown(5);
      setSituation("");
      setSirenOn(false);
      setFlashing(false);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setCoords({ lat: 30.0444, lng: 31.2357 })
        );
      } else {
        setCoords({ lat: 30.0444, lng: 31.2357 });
      }
    }
  }, [open]);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdown(5);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPhase("active");
          setSirenOn(true);
          setFlashing(true);
          onActivate(situation || "General Emergency", coords);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [situation, coords, onActivate]);

  const cancelCountdown = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setCountdown(5);
  };

  const immediateActivate = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("active");
    setSirenOn(true);
    setFlashing(true);
    onActivate(situation || "General Emergency", coords);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div className={`absolute inset-0 ${flashing ? "animate-pulse bg-red-900/40" : "bg-black/70"} backdrop-blur-sm`} />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>

            {phase === "idle" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <Siren className="w-6 h-6 text-red-500" weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Emergency SOS</h2>
                    <p className="text-sm text-slate-400">Select situation and activate alert</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">Situation</label>
                  <div className="flex flex-wrap gap-2">
                    {SITUATION_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSituation(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          situation === tag
                            ? "bg-red-500/20 border-red-500/50 text-red-300"
                            : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {coords && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={startCountdown}
                    className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-500/20"
                  >
                    5s Safety Hold
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={immediateActivate}
                    className="flex-1 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-lg shadow-red-500/30"
                  >
                    Immediate SOS
                  </motion.button>
                </div>
              </div>
            )}

            {phase === "countdown" && (
              <div className="text-center space-y-6 py-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-24 h-24 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
                >
                  <span className="text-4xl font-bold text-red-400">{countdown}</span>
                </motion.div>
                <p className="text-slate-300 text-sm">Alert dispatching in {countdown}s...</p>
                <button onClick={cancelCountdown} className="px-6 py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600">
                  Cancel
                </button>
              </div>
            )}

            {phase === "active" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: sirenOn ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Radio className="w-6 h-6 text-red-500" weight="fill" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold">SOS Active</h3>
                    <p className="text-xs text-slate-400">Notifying emergency contacts...</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {contacts.filter(c => c.isPrimary || true).slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-white">{c.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">{c.phone}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSirenOn(!sirenOn)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border ${sirenOn ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-slate-800 border-slate-700 text-slate-300"}`}
                  >
                    Siren {sirenOn ? "ON" : "OFF"}
                  </button>
                  <button
                    onClick={() => setFlashing(!flashing)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border ${flashing ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-slate-800 border-slate-700 text-slate-300"}`}
                  >
                    Flash {flashing ? "ON" : "OFF"}
                  </button>
                </div>

                <button onClick={onClose} className="w-full py-2 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-600">
                  Deactivate SOS
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
