import { z } from "zod";

export const createPatientSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters")
    .max(80, "Patient name must be 80 characters or less")
});

export const updateSettingsSchema = z.object({
  avgConsultationTime: z.coerce
    .number()
    .int()
    .min(1, "Average consultation time must be at least 1 minute")
    .max(180, "Average consultation time must be 180 minutes or less")
});
