export type SafetyStatus = "safe" | "alert" | "critical";
export type Severity = "low" | "medium" | "high" | "critical";
export type IncidentCategory = "theft" | "assault" | "hazard" | "medical" | "road_incident" | "harassment" | "fire";
export type IncidentStatus = "active" | "under_review" | "resolved";
export type ContactRelation = "family" | "doctor" | "responder" | "friend";

export interface SOSAlert {
  id: string;
  timestamp: number;
  situation: string;
  coordinates: { lat: number; lng: number } | null;
  status: "pending" | "dispatched" | "resolved";
  contactsNotified: string[];
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  severity: Severity;
  status: IncidentStatus;
  location: string;
  description: string;
  timestamp: number;
  reportedBy: string;
  anonymous: boolean;
  upvotes: number;
  coordinates: { lat: number; lng: number };
  verified: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: ContactRelation;
  isPrimary: boolean;
  email?: string;
}

export interface MedicalProfile {
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  emergencyNotes: string;
  organDonor: boolean;
  physicianName: string;
  physicianPhone: string;
}

export interface CheckInTimer {
  active: boolean;
  duration: number;
  startedAt: number;
  label: string;
}

export interface MapPoint {
  id: string;
  type: "police" | "hospital" | "safe_zone" | "fire_station";
  name: string;
  coordinates: { lat: number; lng: number };
}
