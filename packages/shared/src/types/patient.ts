export type PatientStatus = "waiting" | "serving" | "completed";

export interface Patient {
  id: string;
  tokenNumber: number;
  patientName: string;
  status: PatientStatus;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  token_number: number;
  patient_name: string;
  status: PatientStatus;
  created_at: string;
}

export interface CreatePatientInput {
  patientName: string;
}
