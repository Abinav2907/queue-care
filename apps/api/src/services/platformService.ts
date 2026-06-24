import type {
  Doctor,
  DoctorAvailability,
  NotificationReceipt,
  NotificationRequest,
  Patient,
  QueueTimelineItem,
  WaitTimePrediction
} from "@queue-cure/shared";
import {
  addAuditLog,
  listAuditLogs,
  listDoctors,
  queueNotification,
  updateDoctorAvailability
} from "../repositories/platformRepository";
import { HttpError } from "../utils/httpError";

const pausedDoctorIds = new Set<string>();

const priorityWeight = {
  emergency: 0,
  urgent: 0.75,
  priority: 0.75,
  normal: 1
};

function getPriorityWeight(patient: Patient): number {
  return priorityWeight[patient.priority] ?? 1;
}

function getPatientWaitMinutes(
  patient: Patient,
  allPatients: Patient[],
  avgConsultationTime: number
): number {
  if (patient.priority === "emergency") return 0;

  const doctorPatientsAhead = allPatients
    .filter(
      (item) =>
        item.doctorId === patient.doctorId &&
        (item.status === "serving" ||
          (item.status === "waiting" && item.tokenNumber < patient.tokenNumber))
    )
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "serving" ? -1 : 1;
      return a.tokenNumber - b.tokenNumber;
    });

  return Math.max(
    0,
    Math.round(
      doctorPatientsAhead.reduce(
        (total, item) => total + avgConsultationTime * getPriorityWeight(item),
        0
      )
    )
  );
}

export async function getDoctors(): Promise<Doctor[]> {
  return listDoctors();
}

export async function setDoctorAvailability(
  doctorId: string,
  availability: DoctorAvailability
): Promise<Doctor> {
  const doctor = await updateDoctorAvailability(doctorId, availability);
  await addAuditLog("doctor.updated", "doctor", doctor.id, { availability });
  return doctor;
}

export async function pauseQueue(doctorId: string): Promise<void> {
  pausedDoctorIds.add(doctorId);
  await setDoctorAvailability(doctorId, "paused");
  await addAuditLog("queue.paused", "doctor", doctorId);
}

export async function resumeQueue(doctorId: string): Promise<void> {
  pausedDoctorIds.delete(doctorId);
  await setDoctorAvailability(doctorId, "available");
  await addAuditLog("queue.resumed", "doctor", doctorId);
}

export function getPausedDoctorIds(): string[] {
  return [...pausedDoctorIds];
}

export async function getAuditLogs() {
  return listAuditLogs();
}

export async function notifyPatient(input: NotificationRequest): Promise<NotificationReceipt> {
  return queueNotification(input);
}

export function buildTimeline(
  queuePatients: Patient[],
  avgConsultationTime: number
): QueueTimelineItem[] {
  return queuePatients
    .filter((patient) => patient.status === "waiting")
    .map((patient) => {
    return {
      id: patient.id,
      tokenNumber: patient.tokenNumber,
      patientName: patient.patientName,
      doctorId: patient.doctorId,
      status: patient.status,
      priority: patient.priority,
      estimatedStartInMinutes: getPatientWaitMinutes(patient, queuePatients, avgConsultationTime)
    };
  });
}

export function predictWaitTimes(
  queuePatients: Patient[],
  avgConsultationTime: number,
  activeDoctorCount: number
): WaitTimePrediction[] {
  const waitingPatients = queuePatients.filter((patient) => patient.status === "waiting");
  return waitingPatients.map((patient) => {
    const doctorWaitingCount = queuePatients.filter(
      (item) => item.doctorId === patient.doctorId
    ).length;
    const predictedWaitMinutes = getPatientWaitMinutes(
      patient,
      queuePatients,
      avgConsultationTime
    );
    return {
      tokenNumber: patient.tokenNumber,
      predictedWaitMinutes,
      confidence: patient.priority === "normal" ? 0.82 : 0.74,
      factors: [
        `${doctorWaitingCount} waiting for this doctor`,
        `${activeDoctorCount} active doctors`,
        `${patient.priority} priority`,
        `${avgConsultationTime} min average consultation`
      ]
    };
  });
}

export function assertQueueIsCallable(doctorId: string | undefined): void {
  if (doctorId && pausedDoctorIds.has(doctorId)) {
    throw new HttpError(409, "This doctor's queue is paused.");
  }
}
