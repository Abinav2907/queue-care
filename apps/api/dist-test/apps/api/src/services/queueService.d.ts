import type { CreatePatientInput, Patient, PatientQueueView, QueueState } from "@queue-cure/shared";
export declare function getQueueState(): Promise<QueueState>;
export declare function addPatient(input: CreatePatientInput): Promise<Patient>;
export declare function callNextToken(doctorId?: string): Promise<Patient>;
export declare function completeConsultation(doctorId: string): Promise<{
    completedPatient: Patient;
    nextPatient: Patient | null;
}>;
export declare function updateSettings(avgConsultationTime: number): Promise<any>;
export declare function resetQueueForNewDay(): Promise<{
    resetTimestamp: string;
    totalPatientsRemoved: number;
    totalAppointmentsCleared: number;
    queueState: QueueState;
}>;
export declare function getPatientQueueView(tokenNumber: number): Promise<PatientQueueView>;
