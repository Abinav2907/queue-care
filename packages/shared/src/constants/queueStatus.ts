import type { PatientStatus } from "../types/patient";

export const QUEUE_STATUSES = {
  WAITING: "waiting",
  SERVING: "serving",
  COMPLETED: "completed"
} as const satisfies Record<string, PatientStatus>;
