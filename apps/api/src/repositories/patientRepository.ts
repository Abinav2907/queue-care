import { randomUUID } from "node:crypto";
import type { Patient, PatientRecord, PatientStatus } from "@queue-cure/shared";
import { supabase } from "../config/supabase";

const memoryPatients: Patient[] = [];

function toPatient(record: PatientRecord): Patient {
  return {
    id: record.id,
    tokenNumber: record.token_number,
    patientName: record.patient_name,
    status: record.status,
    createdAt: record.created_at
  };
}

export async function listPatients(): Promise<Patient[]> {
  if (!supabase) {
    return [...memoryPatients].sort((a, b) => a.tokenNumber - b.tokenNumber);
  }

  const { data, error } = await supabase
    .from("patients")
    .select("id, token_number, patient_name, status, created_at")
    .order("token_number", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((record) => toPatient(record as PatientRecord));
}

export async function createPatient(patientName: string): Promise<Patient> {
  const patients = await listPatients();
  const nextToken = patients.reduce((max, patient) => Math.max(max, patient.tokenNumber), 0) + 1;

  if (!supabase) {
    const patient: Patient = {
      id: randomUUID(),
      tokenNumber: nextToken,
      patientName,
      status: "waiting",
      createdAt: new Date().toISOString()
    };
    memoryPatients.push(patient);
    return patient;
  }

  const { data, error } = await supabase
    .from("patients")
    .insert({
      token_number: nextToken,
      patient_name: patientName,
      status: "waiting"
    })
    .select("id, token_number, patient_name, status, created_at")
    .single();

  if (error) throw error;
  return toPatient(data as PatientRecord);
}

export async function updatePatientStatus(id: string, status: PatientStatus): Promise<Patient> {
  if (!supabase) {
    const patient = memoryPatients.find((item) => item.id === id);
    if (!patient) throw new Error("Patient not found");
    patient.status = status;
    return patient;
  }

  const { data, error } = await supabase
    .from("patients")
    .update({ status })
    .eq("id", id)
    .select("id, token_number, patient_name, status, created_at")
    .single();

  if (error) throw error;
  return toPatient(data as PatientRecord);
}

export async function completeServingPatients(): Promise<void> {
  const patients = await listPatients();
  await Promise.all(
    patients
      .filter((patient) => patient.status === "serving")
      .map((patient) => updatePatientStatus(patient.id, "completed"))
  );
}
