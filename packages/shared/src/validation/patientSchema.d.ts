import { z } from "zod";
export declare const createPatientSchema: z.ZodObject<{
    patientName: z.ZodString;
    doctorId: z.ZodOptional<z.ZodString>;
    doctorName: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodEnum<["normal", "priority", "urgent", "emergency"]>>;
    appointmentTime: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientName: string;
    priority?: "normal" | "priority" | "urgent" | "emergency" | undefined;
    doctorId?: string | undefined;
    doctorName?: string | undefined;
    room?: string | undefined;
    appointmentTime?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    patientName: string;
    priority?: "normal" | "priority" | "urgent" | "emergency" | undefined;
    doctorId?: string | undefined;
    doctorName?: string | undefined;
    room?: string | undefined;
    appointmentTime?: string | undefined;
    phoneNumber?: string | undefined;
}>;
export declare const updateSettingsSchema: z.ZodObject<{
    avgConsultationTime: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    avgConsultationTime: number;
}, {
    avgConsultationTime: number;
}>;
export declare const updateDoctorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    room: z.ZodOptional<z.ZodString>;
    availability: z.ZodOptional<z.ZodEnum<["available", "busy", "offline", "paused"]>>;
}, "strip", z.ZodTypeAny, {
    room?: string | undefined;
    name?: string | undefined;
    specialty?: string | undefined;
    availability?: "available" | "busy" | "offline" | "paused" | undefined;
}, {
    room?: string | undefined;
    name?: string | undefined;
    specialty?: string | undefined;
    availability?: "available" | "busy" | "offline" | "paused" | undefined;
}>;
export declare const appointmentSchema: z.ZodObject<{
    patientName: z.ZodString;
    doctorId: z.ZodString;
    scheduledAt: z.ZodString;
    priority: z.ZodOptional<z.ZodEnum<["normal", "priority", "urgent", "emergency"]>>;
    phoneNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    patientName: string;
    doctorId: string;
    scheduledAt: string;
    priority?: "normal" | "priority" | "urgent" | "emergency" | undefined;
    phoneNumber?: string | undefined;
}, {
    patientName: string;
    doctorId: string;
    scheduledAt: string;
    priority?: "normal" | "priority" | "urgent" | "emergency" | undefined;
    phoneNumber?: string | undefined;
}>;
export declare const notificationSchema: z.ZodObject<{
    channel: z.ZodEnum<["sms", "whatsapp"]>;
    to: z.ZodString;
    message: z.ZodString;
    patientId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    channel: "sms" | "whatsapp";
    to: string;
    patientId?: string | undefined;
}, {
    message: string;
    channel: "sms" | "whatsapp";
    to: string;
    patientId?: string | undefined;
}>;
