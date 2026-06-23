import { randomUUID } from "node:crypto";
import type {
  AuditAction,
  AuditLog,
  AuditLogRecord,
  Doctor,
  DoctorAvailability,
  DoctorRecord,
  NotificationReceipt,
  NotificationRequest
} from "@queue-cure/shared";
import { supabase } from "../config/supabase";
import { defaultDoctorId } from "./patientRepository";

const memoryDoctors: Doctor[] = [
  {
    id: defaultDoctorId,
    name: "Dr. Asha Menon",
    specialty: "General Medicine",
    availability: "available",
    room: "A-101",
    createdAt: new Date().toISOString()
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Dr. Raj Kumar",
    specialty: "Internal Medicine",
    availability: "available",
    room: "A-102",
    createdAt: new Date().toISOString()
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Dr. Priya Sharma",
    specialty: "Family Medicine",
    availability: "available",
    room: "A-103",
    createdAt: new Date().toISOString()
  }
];
const memoryAuditLogs: AuditLog[] = [];
const memoryNotifications: NotificationReceipt[] = [];
let supabasePlatformAvailable = true;

function toDoctor(record: DoctorRecord): Doctor {
  return {
    id: record.id,
    name: record.name,
    specialty: record.specialty,
    availability: record.availability,
    room: record.room,
    createdAt: record.created_at
  };
}

function toAuditLog(record: AuditLogRecord): AuditLog {
  return {
    id: record.id,
    action: record.action,
    entityType: record.entity_type,
    entityId: record.entity_id,
    metadata: record.metadata ?? {},
    createdAt: record.created_at
  };
}

function fallback(error: unknown): void {
  supabasePlatformAvailable = false;
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message?: unknown }).message)
      : "Supabase platform request failed";
  console.warn(`Supabase platform unavailable, using memory fallback: ${message}`);
}

export async function listDoctors(): Promise<Doctor[]> {
  if (!supabase || !supabasePlatformAvailable) return memoryDoctors;

  const { data, error } = await supabase
    .from("doctors")
    .select("id, name, specialty, availability, room, created_at")
    .order("name");

  if (error) {
    fallback(error);
    return memoryDoctors;
  }

  return data?.length ? data.map((record) => toDoctor(record as DoctorRecord)) : memoryDoctors;
}

export async function updateDoctorAvailability(
  doctorId: string,
  availability: DoctorAvailability
): Promise<Doctor> {
  if (!supabase || !supabasePlatformAvailable) {
    const doctor = memoryDoctors.find((item) => item.id === doctorId) ?? memoryDoctors[0];
    if (!doctor) throw new Error("Doctor not found");
    doctor.availability = availability;
    return doctor;
  }

  const { data, error } = await supabase
    .from("doctors")
    .update({ availability })
    .eq("id", doctorId)
    .select("id, name, specialty, availability, room, created_at")
    .single();

  if (error) {
    fallback(error);
    return updateDoctorAvailability(doctorId, availability);
  }

  return toDoctor(data as DoctorRecord);
}

export async function addAuditLog(
  action: AuditAction,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {}
): Promise<AuditLog> {
  const auditLog: AuditLog = {
    id: randomUUID(),
    action,
    entityType,
    entityId,
    metadata,
    createdAt: new Date().toISOString()
  };

  if (!supabase || !supabasePlatformAvailable) {
    memoryAuditLogs.unshift(auditLog);
    return auditLog;
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata
    })
    .select("id, action, entity_type, entity_id, metadata, created_at")
    .single();

  if (error) {
    fallback(error);
    memoryAuditLogs.unshift(auditLog);
    return auditLog;
  }

  return toAuditLog(data as AuditLogRecord);
}

export async function listAuditLogs(limit = 50): Promise<AuditLog[]> {
  if (!supabase || !supabasePlatformAvailable) return memoryAuditLogs.slice(0, limit);

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    fallback(error);
    return memoryAuditLogs.slice(0, limit);
  }

  return (data ?? []).map((record) => toAuditLog(record as AuditLogRecord));
}

export async function queueNotification(input: NotificationRequest): Promise<NotificationReceipt> {
  const receipt: NotificationReceipt = {
    id: randomUUID(),
    channel: input.channel,
    to: input.to,
    status: "queued",
    createdAt: new Date().toISOString()
  };

  memoryNotifications.unshift(receipt);
  await addAuditLog("notification.queued", "notification", receipt.id, { ...input });
  return receipt;
}
