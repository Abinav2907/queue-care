import { randomUUID } from "node:crypto";
import type { CreatePatientInput, Patient, PatientRecord, PatientStatus, PriorityLevel } from "@queue-cure/shared";
import { supabase } from "../config/supabase.js";

const memoryPatients: Patient[] = [];
let warnedAboutSupabaseFallback = false;
let supabasePatientsAvailable = true;
const patientSelect =
  "id, token_number, patient_name, status, doctor_id, doctor_name, room, priority, appointment_time, consultation_start_time, consultation_end_time, phone_number, tracking_url, created_at";
const resettableStatuses: PatientStatus[] = ["waiting", "serving", "completed", "missed"];

export interface QueueResetResult {
  resetTimestamp: string;
  totalPatientsRemoved: number;
  totalAppointmentsCleared: number;
}

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
  completed: 2,
  missed: 3
};

function getLocalDateKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDayBounds(date = new Date()): { start: Date; end: Date; dateKey: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { start, end, dateKey: getLocalDateKey(start) };
}

function isFutureAppointment(patient: Patient, today = new Date()): boolean {
  if (!patient.appointmentTime) return false;
  return new Date(patient.appointmentTime).getTime() >= getLocalDayBounds(today).end.getTime();
}

function getTokenScopeKey(patient: Patient): string {
  return getLocalDateKey(patient.appointmentTime ?? patient.createdAt);
}

function getInputTokenScopeKey(input: CreatePatientInput): string {
  return getLocalDateKey(input.appointmentTime ?? new Date());
}

function getNextToken(patients: Patient[], input: CreatePatientInput): number {
  const tokenScopeKey = getInputTokenScopeKey(input);
  return (
    patients
      .filter((patient) => getTokenScopeKey(patient) === tokenScopeKey)
      .reduce((max, patient) => Math.max(max, patient.tokenNumber), 0) + 1
  );
}

export function filterLiveQueuePatients(patients: Patient[], today = new Date()): Patient[] {
  return patients.filter((patient) => !isFutureAppointment(patient, today));
}

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
    .select(patientSelect)
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
  const todayKey = getLocalDayBounds().dateKey;
  if (!supabase || !supabasePatientsAvailable) {
    return (
      memoryPatients.find(
        (patient) =>
          patient.tokenNumber === tokenNumber &&
          getTokenScopeKey(patient) === todayKey &&
          !isFutureAppointment(patient),
      ) ??
      memoryPatients.find((patient) => patient.tokenNumber === tokenNumber) ??
      null
    );
  }

  const { data, error } = await supabase
    .from("patients")
    .select(patientSelect)
    .eq("token_number", tokenNumber)
    .order("created_at", { ascending: false });

  if (error) {
    warnSupabaseFallback(error);
    return (
      memoryPatients.find(
        (patient) =>
          patient.tokenNumber === tokenNumber &&
          getTokenScopeKey(patient) === todayKey &&
          !isFutureAppointment(patient),
      ) ??
      memoryPatients.find((patient) => patient.tokenNumber === tokenNumber) ??
      null
    );
  }

  const matches = (data ?? []).map((record) => toPatient(record as PatientRecord));
  return (
    matches.find(
      (patient) =>
        getTokenScopeKey(patient) === todayKey && !isFutureAppointment(patient),
    ) ??
    matches[0] ??
    null
  );
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const patients = await listPatients();
  const nextToken = getNextToken(patients, input);
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
    .select(patientSelect)
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
    .select(patientSelect)
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

export async function resetDailyQueue(now = new Date()): Promise<QueueResetResult> {
  const { end } = getLocalDayBounds(now);
  const resetTimestamp = now.toISOString();

  if (!supabase || !supabasePatientsAvailable) {
    const removedPatients = memoryPatients.filter(
      (patient) =>
        resettableStatuses.includes(patient.status) &&
        (!patient.appointmentTime || new Date(patient.appointmentTime).getTime() < end.getTime()),
    );
    for (const patient of removedPatients) {
      const index = memoryPatients.findIndex((item) => item.id === patient.id);
      if (index >= 0) memoryPatients.splice(index, 1);
    }

    return {
      resetTimestamp,
      totalPatientsRemoved: removedPatients.length,
      totalAppointmentsCleared: removedPatients.filter((patient) => patient.appointmentTime).length,
    };
  }

  const { data, error } = await supabase
    .from("patients")
    .select(patientSelect)
    .in("status", resettableStatuses)
    .or(`appointment_time.is.null,appointment_time.lt.${end.toISOString()}`);

  if (error) {
    warnSupabaseFallback(error);
    return resetDailyQueue(now);
  }

  const patientsToRemove = (data ?? []).map((record) => toPatient(record as PatientRecord));
  const idsToRemove = patientsToRemove.map((patient) => patient.id);

  if (idsToRemove.length) {
    const { error: deleteError } = await supabase
      .from("patients")
      .delete()
      .in("id", idsToRemove);

    if (deleteError) {
      warnSupabaseFallback(deleteError);
      return resetDailyQueue(now);
    }
  }

  return {
    resetTimestamp,
    totalPatientsRemoved: patientsToRemove.length,
    totalAppointmentsCleared: patientsToRemove.filter((patient) => patient.appointmentTime).length,
  };
}
