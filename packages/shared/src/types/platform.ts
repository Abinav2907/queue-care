export type PriorityLevel = "normal" | "priority" | "urgent" | "emergency";
export type DoctorAvailability = "available" | "busy" | "offline" | "paused";
export type AppointmentStatus = "booked" | "checked_in" | "cancelled" | "completed";
export type NotificationChannel = "sms" | "whatsapp";
export type AuditAction =
  | "patient.created"
  | "patient.called"
  | "patient.completed"
  | "settings.updated"
  | "doctor.updated"
  | "queue.paused"
  | "queue.resumed"
  | "QUEUE_RESET"
  | "appointment.created"
  | "notification.queued";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: DoctorAvailability;
  room: string;
  createdAt: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  availability: DoctorAvailability;
  room: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: string;
  scheduledAt: string;
  status: AppointmentStatus;
  phoneNumber?: string | null;
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  patient_name: string;
  doctor_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  phone_number?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface QueueTimelineItem {
  id: string;
  tokenNumber: number;
  patientName: string;
  doctorId: string;
  status: string;
  priority: PriorityLevel;
  estimatedStartInMinutes: number;
}

export interface WaitTimePrediction {
  tokenNumber: number;
  predictedWaitMinutes: number;
  confidence: number;
  factors: string[];
}

export interface NotificationRequest {
  channel: NotificationChannel;
  to: string;
  message: string;
  patientId?: string;
}

export interface NotificationReceipt {
  id: string;
  channel: NotificationChannel;
  to: string;
  status: "queued";
  createdAt: string;
}
