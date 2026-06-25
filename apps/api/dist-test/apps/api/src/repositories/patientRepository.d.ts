import type { CreatePatientInput, Patient, PatientStatus } from "@queue-cure/shared";
export interface QueueResetResult {
    resetTimestamp: string;
    totalPatientsRemoved: number;
    totalAppointmentsCleared: number;
}
export declare const defaultDoctorId = "00000000-0000-4000-8000-000000000001";
export declare function filterLiveQueuePatients(patients: Patient[], today?: Date): Patient[];
export declare function listPatients(): Promise<Patient[]>;
export declare function findPatientByToken(tokenNumber: number): Promise<Patient | null>;
export declare function createPatient(input: CreatePatientInput): Promise<Patient>;
export declare function updatePatientStatus(id: string, status: PatientStatus): Promise<Patient>;
export declare function resetDailyQueue(now?: Date): Promise<QueueResetResult>;
