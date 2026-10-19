import type { Incident, EmergencyContact, MedicalProfile, MapPoint } from "./types";

export const STORAGE_KEYS = {
  incidents: "salama360_incidents",
  contacts: "salama360_contacts",
  medical: "salama360_medical",
  safetyStatus: "salama360_safety_status",
};

export const SEVERITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-500",
};

export const SEVERITY_BG: Record<string, string> = {
  low: "bg-emerald-500/20 border-emerald-500/30",
  medium: "bg-amber-500/20 border-amber-500/30",
  high: "bg-orange-500/20 border-orange-500/30",
  critical: "bg-red-500/20 border-red-500/30",
};

export const CATEGORY_LABELS: Record<string, string> = {
  theft: "Theft",
  assault: "Assault",
  hazard: "Hazard",
  medical: "Medical",
  road_incident: "Road Incident",
  harassment: "Harassment",
  fire: "Fire",
};

export const SITUATION_TAGS = [
  "Medical Emergency",
  "Physical Threat",
  "Traffic Accident",
  "Fire",
  "Stalker / Harassment",
  "Domestic Violence",
  "Lost / Disoriented",
];

export const EMERGENCY_HOTLINES = [
  { label: "Police", number: "999", icon: "shield" },
  { label: "Ambulance", number: "998", icon: "heart" },
  { label: "Fire Rescue", number: "997", icon: "flame" },
  { label: "Gender Violence Helpline", number: "1959", icon: "phone" },
];

export const DEFAULT_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    title: "Armed Robbery at Market",
    category: "theft",
    severity: "high",
    status: "active",
    location: "Al-Maada Market, Cairo",
    description: "Two suspects with weapons targeted vendors at the east entrance.",
    timestamp: Date.now() - 3600000 * 2,
    reportedBy: "Community Member",
    anonymous: true,
    upvotes: 14,
    coordinates: { lat: 30.0444, lng: 31.2357 },
    verified: true,
  },
  {
    id: "inc-2",
    title: "Hit and Run on Ring Road",
    category: "road_incident",
    severity: "critical",
    status: "under_review",
    location: "Ring Road, Km 28",
    description: "Pedestrian struck by unidentified vehicle. Victim transported to hospital.",
    timestamp: Date.now() - 3600000 * 5,
    reportedBy: "Witness",
    anonymous: false,
    upvotes: 8,
    coordinates: { lat: 30.0321, lng: 31.2899 },
    verified: true,
  },
  {
    id: "inc-3",
    title: "Stalking Near University",
    category: "harassment",
    severity: "medium",
    status: "active",
    location: "Cairo University Gate 3",
    description: "Repeated following of female students by a man on motorcycle.",
    timestamp: Date.now() - 3600000 * 8,
    reportedBy: "Student Union",
    anonymous: true,
    upvotes: 22,
    coordinates: { lat: 30.0289, lng: 31.2072 },
    verified: false,
  },
  {
    id: "inc-4",
    title: "Gas Leak in Residential Area",
    category: "hazard",
    severity: "high",
    status: "resolved",
    location: "Nasr City, Block 12",
    description: "Strong gas odor reported. Evacuation completed safely.",
    timestamp: Date.now() - 3600000 * 24,
    reportedBy: "Resident",
    anonymous: false,
    upvotes: 5,
    coordinates: { lat: 30.0672, lng: 31.3389 },
    verified: true,
  },
  {
    id: "inc-5",
    title: "Cardiac Emergency at Metro",
    category: "medical",
    severity: "critical",
    status: "resolved",
    location: "Sadat Metro Station",
    description: "Elderly man collapsed. First responders administered CPR until ambulance arrived.",
    timestamp: Date.now() - 3600000 * 48,
    reportedBy: "Metro Staff",
    anonymous: false,
    upvotes: 11,
    coordinates: { lat: 30.0444, lng: 31.2357 },
    verified: true,
  },
];

export const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: "c-1", name: "Ahmed Hassan", phone: "+20 100 123 4567", relation: "family", isPrimary: true, email: "ahmed@email.com" },
  { id: "c-2", name: "Dr. Sara Mansour", phone: "+20 101 987 6543", relation: "doctor", isPrimary: false, email: "sara@clinic.com" },
  { id: "c-3", name: "Nearest Police Station", phone: "999", relation: "responder", isPrimary: false },
  { id: "c-4", name: "Nour El Din", phone: "+20 102 555 7890", relation: "friend", isPrimary: false },
];

export const DEFAULT_MEDICAL: MedicalProfile = {
  bloodType: "O+",
  allergies: "Penicillin, Peanuts",
  chronicConditions: "Asthma (mild)",
  medications: "Salbutamol inhaler PRN",
  emergencyNotes: "If unconscious, do NOT move. Call Dr. Sara first.",
  organDonor: true,
  physicianName: "Dr. Sara Mansour",
  physicianPhone: "+20 101 987 6543",
};

export const MAP_POINTS: MapPoint[] = [
  { id: "mp-1", type: "police", name: "Maadi Police Station", coordinates: { lat: 30.033, lng: 31.254 } },
  { id: "mp-2", type: "hospital", name: "Maadi General Hospital", coordinates: { lat: 30.041, lng: 31.248 } },
  { id: "mp-3", type: "safe_zone", name: "City Center Mall (Safe Haven)", coordinates: { lat: 30.038, lng: 31.262 } },
  { id: "mp-4", type: "fire_station", name: "Nasr City Fire Brigade", coordinates: { lat: 30.065, lng: 31.335 } },
  { id: "mp-5", type: "police", name: "Dokki Police Precinct", coordinates: { lat: 30.048, lng: 31.201 } },
  { id: "mp-6", type: "hospital", name: "Cairo University Hospital", coordinates: { lat: 30.029, lng: 31.207 } },
];

export const PDF_URL = "https://dala-prod-public-storage.s3.eu-west-1.amazonaws.com/attachments/fa5c1141-524d-4fcd-8164-c9488d3c0bfb/1792444270210_Salama_360_Pdf.pdf";
