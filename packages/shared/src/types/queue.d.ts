import type { Patient } from "./patient.ts";
import type { AuditLog, Doctor, QueueTimelineItem, WaitTimePrediction } from "./platform.ts";
import type { QueueSettings } from "./settings.ts";
export interface QueueAnalytics {
    totalWaiting: number;
    patientsServed: number;
    averageWait: number;
}
export interface QueueState {
    patients: Patient[];
    currentToken: Patient | null;
    currentTokens: Patient[];
    waitingPatients: Patient[];
    completedPatients: Patient[];
    doctors: Doctor[];
    appointmentPatients: Patient[];
    pausedDoctorIds: string[];
    auditLogs: AuditLog[];
    timeline: QueueTimelineItem[];
    predictions: WaitTimePrediction[];
    settings: QueueSettings;
    analytics: QueueAnalytics;
    updatedAt: string;
}
export interface PatientQueueView {
    patient: Patient;
    currentToken: number | null;
    currentServingPatient: Patient | null;
    tokensAhead: number;
    estimatedWaitTime: number;
    queuePosition: number | null;
    statusMessage: string;
}
