import { z } from "zod";
export const createPatientSchema = z.object({
    patientName: z
        .string()
        .trim()
        .min(2, "Patient name must be at least 2 characters")
        .max(80, "Patient name must be 80 characters or less"),
    doctorId: z.string().uuid().optional(),
    doctorName: z.string().trim().min(2).max(80).optional(),
    room: z.string().trim().min(1).max(24).optional(),
    priority: z.enum(["normal", "priority", "urgent", "emergency"]).optional(),
    appointmentTime: z.string().datetime().optional(),
    phoneNumber: z.string().trim().min(7).max(20).optional()
});
export const updateSettingsSchema = z.object({
    avgConsultationTime: z.coerce
        .number()
        .int()
        .min(1, "Average consultation time must be at least 1 minute")
        .max(180, "Average consultation time must be 180 minutes or less")
});
export const updateDoctorSchema = z.object({
    name: z.string().trim().min(2).max(80).optional(),
    specialty: z.string().trim().min(2).max(80).optional(),
    room: z.string().trim().min(1).max(24).optional(),
    availability: z.enum(["available", "busy", "offline", "paused"]).optional()
});
export const appointmentSchema = z.object({
    patientName: z.string().trim().min(2).max(80),
    doctorId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    priority: z.enum(["normal", "priority", "urgent", "emergency"]).optional(),
    phoneNumber: z.string().trim().min(7).max(20).optional()
});
export const notificationSchema = z.object({
    channel: z.enum(["sms", "whatsapp"]),
    to: z.string().trim().min(7).max(20),
    message: z.string().trim().min(3).max(320),
    patientId: z.string().uuid().optional()
});
//# sourceMappingURL=patientSchema.js.map