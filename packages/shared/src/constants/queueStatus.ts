import type { PatientStatus } from "../types/patient.js";

export const QUEUE_STATUSES = {
  WAITING: "waiting",
  SERVING: "serving",
  COMPLETED: "completed",
  MISSED: "missed",
} as const satisfies Record<string, PatientStatus>;
