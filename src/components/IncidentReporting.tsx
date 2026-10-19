import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MagnifyingGlass, Check, Eye, MapPin, ShieldCheck } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { Incident, IncidentCategory, Severity, IncidentStatus } from "../types";
import { SEVERITY_LABELS, SEVERITY_COLORS, SEVERITY_BG, CATEGORY_LABELS } from "../constants";

interface IncidentReportingProps {
  incidents: Incident[];
  onAdd: (incident: Incident) => void;
  onUpvote: (id: string) => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
}

export default function IncidentReporting({ incidents, onAdd, onUpvote, onUpdateStatus }: IncidentReportingProps) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | "all">("all");

  const [form, setForm] = useState({
    title: "",
    category: "theft" as IncidentCategory,
    severity: "medium" as Severity,
    location: "",
    description: "",
    anonymous: true,
  });

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (statusFilter !== "all" && inc.status !== statusFilter) return false;
      if (categoryFilter !== "all" && inc.category !== categoryFilter) return false;
      if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) && !inc.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [incidents, search, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(incidents.map((i) => i.category));
    return Array.from(set);
  }, [incidents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.location) {
      toast.error("Title and location are required");
      return;
    }
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: form.title,
      category: form.category,
      severity: form.severity,
      status: "active",
      location: form.location,
      description: form.description,
      timestamp: Date.now(),
      reportedBy: form.anonymous ? "Anonymous" : "You",
      anonymous: form.anonymous,
      upvotes: 0,
      coordinates: { lat: 30.0444 + (Math.random() - 0.5) * 0.02, lng: 31.2357 + (Math.random() - 0.5) * 0.02 },
      verified: false,
    };
    onAdd(newIncident);
    toast.success("Incident reported successfully");
    setShowForm(false);
    setForm({ title: "", category: "theft", severity: "medium", location: "", description: "", anonymous: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search incidents..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as IncidentStatus | "all")} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as IncidentCategory | "all")} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium">
          <Plus className="w-4 h-4" /> Report
        </motion.button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No incidents match your filters</p>
          </div>
        ) : (
          filtered.map((inc) => (
            <motion.div
              key={inc.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-semibold text-sm truncate">{inc.title}</h4>
                    {inc.verified && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {inc.location}
                  </p>
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">{inc.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${SEVERITY_BG[inc.severity]} ${SEVERITY_COLORS[inc.severity]}`}>
                  {SEVERITY_LABELS[inc.severity]}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700/50 border border-slate-600/50 text-slate-300">
                  {CATEGORY_LABELS[inc.category]}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  inc.status === "active" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                  inc.status === "under_review" ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {inc.status === "under_review" ? "Under Review" : inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => onUpvote(inc.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> {inc.upvotes}
                  </button>
                  {inc.status === "active" && (
                    <button
                      onClick={() => onUpdateStatus(inc.id, "under_review")}
                      className="text-[10px] text-amber-400 hover:text-amber-300"
                    >
                      Review
                    </button>
                  )}
                  {inc.status === "under_review" && (
                    <button
                      onClick={() => onUpdateStatus(inc.id, "resolved")}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                {inc.anonymous ? "Anonymous" : inc.reportedBy} · {new Date(inc.timestamp).toLocaleString()}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6"
            >
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white mb-4">Report Incident</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Incident title *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as IncidentCategory })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                    {Object.entries(SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Location / Address *"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description..."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none"
                />
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} className="rounded" />
                  Submit anonymously
                </label>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors">
                  Submit Report
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
