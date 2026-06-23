import type { Patient } from "./patient";
import type { QueueSettings } from "./settings";

export interface QueueAnalytics {
  totalWaiting: number;
  patientsServed: number;
  averageWait: number;
}

export interface QueueState {
  patients: Patient[];
  currentToken: Patient | null;
  waitingPatients: Patient[];
  completedPatients: Patient[];
  settings: QueueSettings;
  analytics: QueueAnalytics;
  updatedAt: string;
}

export interface PatientQueueView {
  currentToken: number | null;
  tokensAhead: number;
  estimatedWaitTime: number;
  queuePosition: number | null;
  statusMessage: string;
}
