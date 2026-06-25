import type { AuditAction, AuditLog, Doctor, DoctorAvailability, NotificationReceipt, NotificationRequest } from "@queue-cure/shared";
export declare function listDoctors(): Promise<Doctor[]>;
export declare function updateDoctorAvailability(doctorId: string, availability: DoctorAvailability): Promise<Doctor>;
export declare function addAuditLog(action: AuditAction, entityType: string, entityId: string | null, metadata?: Record<string, unknown>): Promise<AuditLog>;
export declare function listAuditLogs(limit?: number): Promise<AuditLog[]>;
export declare function queueNotification(input: NotificationRequest): Promise<NotificationReceipt>;
