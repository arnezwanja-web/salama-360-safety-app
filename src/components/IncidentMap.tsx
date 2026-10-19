import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Crosshair, Shield, Flame, FirstAid, House, X } from "@phosphor-icons/react";
import type { Incident, MapPoint, Severity, IncidentCategory } from "../types";
import { SEVERITY_COLORS, SEVERITY_BG, SEVERITY_LABELS, CATEGORY_LABELS } from "../constants";

interface IncidentMapProps {
  incidents: Incident[];
  mapPoints: MapPoint[];
  userCoords: { lat: number; lng: number };
}

const pointIcons: Record<string, React.ReactNode> = {
  police: <Shield className="w-4 h-4 text-blue-400" weight="fill" />,
  hospital: <FirstAid className="w-4 h-4 text-emerald-400" weight="fill" />,
  safe_zone: <House className="w-4 h-4 text-emerald-300" weight="fill" />,
  fire_station: <Flame className="w-4 h-4 text-orange-400" weight="fill" />,
};

function projectCoords(lat: number, lng: number, center: { lat: number; lng: number }, width: number, height: number, zoom: number) {
  const scale = zoom * 8000;
  const x = width / 2 + (lng - center.lng) * scale;
  const y = height / 2 - (lat - center.lat) * scale;
  return { x, y };
}

export default function IncidentMap({ incidents, mapPoints, userCoords }: IncidentMapProps) {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | "all">("all");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [zoom, setZoom] = useState(1);

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter !== "all" && inc.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && inc.category !== categoryFilter) return false;
      return true;
    });
  }, [incidents, severityFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(incidents.map((i) => i.category));
    return Array.from(set);
  }, [incidents]);

  const width = 700;
  const height = 450;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as IncidentCategory | "all")}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700">-</button>
          <span className="text-xs text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700">+</button>
        </div>
      </div>

      <div className="relative rounded-xl border border-slate-700/50 overflow-hidden bg-slate-900">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="block">
          <defs>
            <radialGradient id="radar" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width={width} height={height} fill="#0f172a" />
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * (width / 8)} y1={0} x2={(i + 1) * (width / 8)} y2={height} stroke="#1e293b" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * (height / 5)} x2={width} y2={(i + 1) * (height / 5)} stroke="#1e293b" strokeWidth="0.5" />
          ))}

          <circle cx={width / 2} cy={height / 2} r={80 * zoom} fill="url(#radar)" />

          {mapPoints.map((pt) => {
            const pos = projectCoords(pt.coordinates.lat, pt.coordinates.lng, userCoords, width, height, zoom);
            if (pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height) return null;
            return (
              <g key={pt.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r={10} fill="#1e293b" stroke="#334155" strokeWidth="1" />
                <text textAnchor="middle" dy="4" fontSize="10" fill="#94a3b8">
                  {pt.type === "police" ? "P" : pt.type === "hospital" ? "H" : pt.type === "safe_zone" ? "S" : "F"}
                </text>
              </g>
            );
          })}

          {filtered.map((inc) => {
            const pos = projectCoords(inc.coordinates.lat, inc.coordinates.lng, userCoords, width, height, zoom);
            if (pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height) return null;
            const color = inc.severity === "critical" ? "#ef4444" : inc.severity === "high" ? "#f97316" : inc.severity === "medium" ? "#f59e0b" : "#10b981";
            return (
              <g key={inc.id} onClick={() => setSelectedIncident(inc)} className="cursor-pointer">
                {inc.severity === "critical" && (
                  <circle cx={pos.x} cy={pos.y} r={14} fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                    <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={pos.x} cy={pos.y} r={7} fill={color} opacity="0.9" />
                <circle cx={pos.x} cy={pos.y} r={3} fill="#0f172a" />
              </g>
            );
          })}

          <g transform={`translate(${width / 2}, ${height / 2})`}>
            <circle r={12} fill="none" stroke="#10b981" strokeWidth="2" opacity="0.4">
              <animate attributeName="r" from="12" to="30" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
            </circle>
            <Crosshair className="text-emerald-400" weight="fill" />
            <circle r={5} fill="#10b981" />
          </g>
        </svg>

        <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-1.5 border border-slate-700/50">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> You</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Low</span>
        </div>
      </div>

      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={`w-5 h-5 ${SEVERITY_COLORS[selectedIncident.severity]}`} />
                <h4 className="text-white font-semibold text-sm">{selectedIncident.title}</h4>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedIncident.location}</p>
            <p className="text-sm text-slate-300 mt-2">{selectedIncident.description}</p>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className={`px-2 py-0.5 rounded-full border ${SEVERITY_BG[selectedIncident.severity]} ${SEVERITY_COLORS[selectedIncident.severity]}`}>
                {SEVERITY_LABELS[selectedIncident.severity]}
              </span>
              <span className="text-slate-400">{CATEGORY_LABELS[selectedIncident.category]}</span>
              <span className="text-slate-500 ml-auto">{new Date(selectedIncident.timestamp).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
