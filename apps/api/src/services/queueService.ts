import type { CreatePatientInput, Patient, QueueState } from "@queue-cure/shared";
import {
  completeServingPatients,
  createPatient,
  listPatients,
  updatePatientStatus
} from "../repositories/patientRepository";
import { getSettings, updateSettings as persistSettings } from "../repositories/settingsRepository";
import { HttpError } from "../utils/httpError";
import { getAnalytics } from "./waitTimeService";

export async function getQueueState(): Promise<QueueState> {
  const [patients, settings] = await Promise.all([listPatients(), getSettings()]);
  const waitingPatients = patients.filter((patient) => patient.status === "waiting");
  const completedPatients = patients.filter((patient) => patient.status === "completed");
  const currentToken = patients.find((patient) => patient.status === "serving") ?? null;

  return {
    patients,
    currentToken,
    waitingPatients,
    completedPatients,
    settings,
    analytics: getAnalytics(patients, settings),
    updatedAt: new Date().toISOString()
  };
}

export async function addPatient(input: CreatePatientInput): Promise<Patient> {
  return createPatient(input.patientName);
}

export async function callNextToken(): Promise<Patient> {
  await completeServingPatients();
  const patients = await listPatients();
  const nextPatient = patients.find((patient) => patient.status === "waiting");

  if (!nextPatient) {
    throw new HttpError(409, "There are no waiting patients to call.");
  }

  return updatePatientStatus(nextPatient.id, "serving");
}

export async function updateSettings(avgConsultationTime: number) {
  return persistSettings(avgConsultationTime);
}
