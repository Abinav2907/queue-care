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
  urgent: 0.5,
  priority: 0.75,
  normal: 1
};

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
  waitingPatients: Patient[],
  avgConsultationTime: number
): QueueTimelineItem[] {
  let elapsed = 0;
  return waitingPatients.map((patient) => {
    const item: QueueTimelineItem = {
      id: patient.id,
      tokenNumber: patient.tokenNumber,
      patientName: patient.patientName,
      doctorId: patient.doctorId,
      status: patient.status,
      priority: patient.priority,
      estimatedStartInMinutes: Math.round(elapsed)
    };
    elapsed += avgConsultationTime * priorityWeight[patient.priority];
    return item;
  });
}

export function predictWaitTimes(
  waitingPatients: Patient[],
  avgConsultationTime: number,
  activeDoctorCount: number
): WaitTimePrediction[] {
  const doctorCapacity = Math.max(1, activeDoctorCount);
  return waitingPatients.map((patient, index) => {
    const priorityBoost = priorityWeight[patient.priority];
    const predictedWaitMinutes = Math.max(
      0,
      Math.round(((index * avgConsultationTime) / doctorCapacity) * priorityBoost)
    );

    return {
      tokenNumber: patient.tokenNumber,
      predictedWaitMinutes,
      confidence: patient.priority === "normal" ? 0.82 : 0.74,
      factors: [
        `${waitingPatients.length} waiting`,
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
