import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Phone, Pencil, Trash, User, Heart, ShieldCheck, Printer, FileText, Info } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { EmergencyContact, MedicalProfile, ContactRelation } from "../types";
import { PDF_URL } from "../constants";

interface ContactsAndProfileProps {
  contacts: EmergencyContact[];
  medical: MedicalProfile;
  onAddContact: (contact: EmergencyContact) => void;
  onUpdateContact: (contact: EmergencyContact) => void;
  onDeleteContact: (id: string) => void;
  onUpdateMedical: (profile: MedicalProfile) => void;
}

const relationLabels: Record<ContactRelation, string> = {
  family: "Family",
  doctor: "Doctor",
  responder: "Responder",
  friend: "Friend",
};

const relationColors: Record<ContactRelation, string> = {
  family: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  doctor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  responder: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  friend: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function ContactsAndProfile({ contacts, medical, onAddContact, onUpdateContact, onDeleteContact, onUpdateMedical }: ContactsAndProfileProps) {
  const [tab, setTab] = useState<"contacts" | "medical">("contacts");
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", relation: "family" as ContactRelation, isPrimary: false, email: "" });
  const [medicalForm, setMedicalForm] = useState(medical);

  const resetForm = () => {
    setContactForm({ name: "", phone: "", relation: "family", isPrimary: false, email: "" });
    setEditingContact(null);
    setShowContactForm(false);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone) {
      toast.error("Name and phone are required");
      return;
    }
    if (editingContact) {
      onUpdateContact({ ...editingContact, ...contactForm });
      toast.success("Contact updated");
    } else {
      const newContact: EmergencyContact = {
        id: `c-${Date.now()}`,
        ...contactForm,
      };
      onAddContact(newContact);
      toast.success("Contact added");
    }
    resetForm();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({ name: contact.name, phone: contact.phone, relation: contact.relation, isPrimary: contact.isPrimary, email: contact.email || "" });
    setShowContactForm(true);
  };

  const handleDelete = (id: string) => {
    onDeleteContact(id);
    toast.success("Contact removed");
  };

  const handleTestCall = (contact: EmergencyContact) => {
    toast.success(`Simulated call to ${contact.name} (${contact.phone})`);
  };

  const handleTestSMS = (contact: EmergencyContact) => {
    toast.success(`Test SMS sent to ${contact.name}`);
  };

  const handleSaveMedical = () => {
    onUpdateMedical(medicalForm);
    toast.success("Medical profile saved");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50 w-fit">
        <button onClick={() => setTab("contacts")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "contacts" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
          <User className="w-3.5 h-3.5 inline mr-1.5" />Contacts
        </button>
        <button onClick={() => setTab("medical")} className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${tab === "medical" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
          <Heart className="w-3.5 h-3.5 inline mr-1.5" />Medical ID
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "contacts" && (
          <motion.div key="contacts" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => { resetForm(); setShowContactForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium">
                <Plus className="w-4 h-4" /> Add Contact
              </button>
            </div>

            {contacts.map((c) => (
              <motion.div key={c.id} layout className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm flex items-center gap-2">
                        {c.name}
                        {c.isPrimary && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      </h4>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${relationColors[c.relation]}`}>
                    {relationLabels[c.relation]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <button onClick={() => handleTestCall(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </button>
                  <button onClick={() => handleTestSMS(c)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">
                    <FileText className="w-3.5 h-3.5" /> SMS
                  </button>
                  <button onClick={() => handleEdit(c)} className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {showContactForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <form onSubmit={handleSaveContact} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white text-sm font-medium">{editingContact ? "Edit Contact" : "New Contact"}</h4>
                      <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <input value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Full name *" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
                    <input value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="Phone number *" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={contactForm.relation} onChange={(e) => setContactForm({ ...contactForm, relation: e.target.value as ContactRelation })} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                        {Object.entries(relationLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-xs text-slate-300 px-2">
                        <input type="checkbox" checked={contactForm.isPrimary} onChange={(e) => setContactForm({ ...contactForm, isPrimary: e.target.checked })} className="rounded" />
                        Primary SOS
                      </label>
                    </div>
                    <button type="submit" className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium">
                      {editingContact ? "Update" : "Add"} Contact
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "medical" && (
          <motion.div key="medical" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" weight="fill" /> Emergency Medical ID
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:text-white">
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700/50 text-xs text-slate-300 hover:text-white">
                    <FileText className="w-3.5 h-3.5" /> Spec PDF
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Blood Type</label>
                  <select value={medicalForm.bloodType} onChange={(e) => setMedicalForm({ ...medicalForm, bloodType: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Organ Donor</label>
                  <label className="flex items-center gap-2 py-2 px-3 bg-slate-900 border border-slate-700 rounded-lg">
                    <input type="checkbox" checked={medicalForm.organDonor} onChange={(e) => setMedicalForm({ ...medicalForm, organDonor: e.target.checked })} className="rounded" />
                    <span className="text-sm text-white">{medicalForm.organDonor ? "Yes" : "No"}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Allergies</label>
                <input value={medicalForm.allergies} onChange={(e) => setMedicalForm({ ...medicalForm, allergies: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Chronic Conditions</label>
                <input value={medicalForm.chronicConditions} onChange={(e) => setMedicalForm({ ...medicalForm, chronicConditions: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Medications</label>
                <input value={medicalForm.medications} onChange={(e) => setMedicalForm({ ...medicalForm, medications: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Emergency Notes</label>
                <textarea value={medicalForm.emergencyNotes} onChange={(e) => setMedicalForm({ ...medicalForm, emergencyNotes: e.target.value })} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Physician Name</label>
                  <input value={medicalForm.physicianName} onChange={(e) => setMedicalForm({ ...medicalForm, physicianName: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1 block">Physician Phone</label>
                  <input value={medicalForm.physicianPhone} onChange={(e) => setMedicalForm({ ...medicalForm, physicianPhone: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>

              <button onClick={handleSaveMedical} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm">
                Save Medical Profile
              </button>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Salama 360 Specification</p>
                <p>This application follows the Salama 360 personal safety framework. View the full requirements document via the PDF link above.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
