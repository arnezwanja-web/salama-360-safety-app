import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Warning, Siren, X } from "@phosphor-icons/react";
import type { SafetyStatus } from "../types";

interface NavbarProps {
  safetyStatus: SafetyStatus;
  onSOS: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const statusConfig: Record<SafetyStatus, { label: string; color: string; bg: string }> = {
  safe: { label: "Safe", color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40" },
  alert: { label: "Elevated", color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/40" },
  critical: { label: "SOS Active", color: "text-red-500", bg: "bg-red-500/20 border-red-500/40" },
};

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "map", label: "Incident Map" },
  { id: "reports", label: "Incident Log" },
  { id: "contacts", label: "Contacts & Medical" },
];

export default function Navbar({ safetyStatus, onSOS, activeTab, onTabChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const status = statusConfig[safetyStatus];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-emerald-400" weight="fill" />
          <span className="text-lg font-bold tracking-tight text-white">Salama 360</span>
          <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
            {safetyStatus === "critical" && (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2 h-2 rounded-full bg-red-500"
              />
            )}
            {status.label}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-700/60 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onSOS}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              safetyStatus === "critical"
                ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                : "bg-red-500/90 hover:bg-red-500 text-white shadow-lg shadow-red-500/20"
            }`}
          >
            <Siren className="w-4 h-4" weight="fill" />
            <span className="hidden sm:inline">SOS</span>
          </motion.button>

          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Warning className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { onTabChange(tab.id); setMobileOpen(false); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-slate-700/60 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
