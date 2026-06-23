import type { PriorityLevel } from "./platform";

export type PatientStatus = "waiting" | "serving" | "completed";

export interface Patient {
  id: string;
  tokenNumber: number;
  patientName: string;
  status: PatientStatus;
  doctorId: string;
  doctorName: string;
  room: string;
  priority: PriorityLevel;
  appointmentTime?: string | null;
  consultationStartTime?: string | null;
  consultationEndTime?: string | null;
  phoneNumber?: string | null;
  trackingUrl?: string | null;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  token_number: number;
  patient_name: string;
  status: PatientStatus;
  doctor_id?: string | null;
  doctor_name?: string | null;
  room?: string | null;
  priority?: PriorityLevel | null;
  appointment_time?: string | null;
  consultation_start_time?: string | null;
  consultation_end_time?: string | null;
  phone_number?: string | null;
  tracking_url?: string | null;
  created_at: string;
}

export interface CreatePatientInput {
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  room?: string;
  priority?: PriorityLevel;
  appointmentTime?: string;
  phoneNumber?: string;
}
