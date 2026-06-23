import { randomUUID } from "node:crypto";
import type { CreatePatientInput, Patient, PatientRecord, PatientStatus, PriorityLevel } from "@queue-cure/shared";
import { supabase } from "../config/supabase";

const memoryPatients: Patient[] = [];
let warnedAboutSupabaseFallback = false;
let supabasePatientsAvailable = true;

function warnSupabaseFallback(error: unknown): void {
  supabasePatientsAvailable = false;
  if (warnedAboutSupabaseFallback) return;
  warnedAboutSupabaseFallback = true;
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : "Supabase request failed";
  console.warn(`Supabase patients unavailable, using in-memory queue fallback: ${message}`);
}

function toPatient(record: PatientRecord): Patient {
  return {
    id: record.id,
    tokenNumber: record.token_number,
    patientName: record.patient_name,
    status: record.status,
    doctorId: record.doctor_id ?? defaultDoctorId,
    doctorName: record.doctor_name ?? "Dr. Asha Menon",
    room: record.room ?? "A-101",
    priority: record.priority ?? "normal",
    appointmentTime: record.appointment_time ?? null,
    consultationStartTime: record.consultation_start_time ?? null,
    consultationEndTime: record.consultation_end_time ?? null,
    phoneNumber: record.phone_number ?? null,
    trackingUrl: record.tracking_url ?? null,
    createdAt: record.created_at
  };
}

export const defaultDoctorId = "00000000-0000-4000-8000-000000000001";

const priorityRank: Record<PriorityLevel, number> = {
  emergency: 0,
  urgent: 1,
  priority: 2,
  normal: 3
};

const statusRank: Record<PatientStatus, number> = {
  serving: 0,
  waiting: 1,
  completed: 2
};

function sortQueue(a: Patient, b: Patient): number {
  return (
    a.doctorName.localeCompare(b.doctorName) ||
    statusRank[a.status] - statusRank[b.status] ||
    priorityRank[a.priority] - priorityRank[b.priority] ||
    a.tokenNumber - b.tokenNumber
  );
}

export async function listPatients(): Promise<Patient[]> {
  if (!supabase || !supabasePatientsAvailable) {
    return [...memoryPatients].sort(sortQueue);
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, token_number, patient_name, status, doctor_id, doctor_name, room, priority, appointment_time, consultation_start_time, consultation_end_time, phone_number, tracking_url, created_at")
    .order("status", { ascending: false })
    .order("priority", { ascending: true })
    .order("token_number", { ascending: true });

  if (error) {
    warnSupabaseFallback(error);
    return [...memoryPatients].sort(sortQueue);
  }

  return (data ?? []).map((record) => toPatient(record as PatientRecord)).sort(sortQueue);
}

export async function findPatientByToken(tokenNumber: number): Promise<Patient | null> {
  if (!supabase || !supabasePatientsAvailable) {
    return memoryPatients.find((patient) => patient.tokenNumber === tokenNumber) ?? null;
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, token_number, patient_name, status, doctor_id, doctor_name, room, priority, appointment_time, consultation_start_time, consultation_end_time, phone_number, tracking_url, created_at")
    .eq("token_number", tokenNumber)
    .maybeSingle();

  if (error) {
    warnSupabaseFallback(error);
    return memoryPatients.find((patient) => patient.tokenNumber === tokenNumber) ?? null;
  }

  return data ? toPatient(data as PatientRecord) : null;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const patients = await listPatients();
  const nextToken = patients.reduce((max, patient) => Math.max(max, patient.tokenNumber), 0) + 1;
  const doctorId = input.doctorId ?? defaultDoctorId;
  const doctorName = input.doctorName ?? "Dr. Asha Menon";
  const room = input.room ?? "A-101";
  const priority = input.priority ?? "normal";
  const trackingUrl = `/waiting-room?token=${nextToken}`;

  if (!supabase || !supabasePatientsAvailable) {
    const patient: Patient = {
      id: randomUUID(),
      tokenNumber: nextToken,
      patientName: input.patientName,
      status: "waiting",
      doctorId,
      doctorName,
      room,
      priority,
      appointmentTime: input.appointmentTime ?? null,
      consultationStartTime: null,
      consultationEndTime: null,
      phoneNumber: input.phoneNumber ?? null,
      trackingUrl,
      createdAt: new Date().toISOString()
    };
    memoryPatients.push(patient);
    return patient;
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      token_number: nextToken,
      patient_name: input.patientName,
      status: "waiting",
      doctor_id: doctorId,
      doctor_name: doctorName,
      room,
      priority,
      appointment_time: input.appointmentTime,
      phone_number: input.phoneNumber,
      tracking_url: trackingUrl
    })
    .select("id, token_number, patient_name, status, doctor_id, doctor_name, room, priority, appointment_time, consultation_start_time, consultation_end_time, phone_number, tracking_url, created_at")
    .single();

  if (error) {
    warnSupabaseFallback(error);
    const patient: Patient = {
      id: randomUUID(),
      tokenNumber: nextToken,
      patientName: input.patientName,
      status: "waiting",
      doctorId,
      doctorName,
      room,
      priority,
      appointmentTime: input.appointmentTime ?? null,
      consultationStartTime: null,
      consultationEndTime: null,
      phoneNumber: input.phoneNumber ?? null,
      trackingUrl,
      createdAt: new Date().toISOString()
    };
    memoryPatients.push(patient);
    return patient;
  }

  return toPatient(data as PatientRecord);
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<Patient> {
  if (!supabase || !supabasePatientsAvailable) {
    const patient = memoryPatients.find((item) => item.id === id);
    if (!patient) throw new Error("Patient not found");
    patient.status = status;
    if (status === "serving") patient.consultationStartTime = new Date().toISOString();
    if (status === "completed") patient.consultationEndTime = new Date().toISOString();
    return patient;
  }

  const { data, error } = await supabase
    .from("patients")
    .update({
      status,
      consultation_start_time: status === "serving" ? new Date().toISOString() : undefined,
      consultation_end_time: status === "completed" ? new Date().toISOString() : undefined
    })
    .eq("id", id)
    .select("id, token_number, patient_name, status, doctor_id, doctor_name, room, priority, appointment_time, consultation_start_time, consultation_end_time, phone_number, tracking_url, created_at")
    .single();

  if (error) {
    warnSupabaseFallback(error);
    const patient = memoryPatients.find((item) => item.id === id);
    if (!patient) throw new Error("Patient not found");
    patient.status = status;
    if (status === "serving") patient.consultationStartTime = new Date().toISOString();
    if (status === "completed") patient.consultationEndTime = new Date().toISOString();
    return patient;
  }

  return toPatient(data as PatientRecord);
}
