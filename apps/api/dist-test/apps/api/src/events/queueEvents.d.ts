import type { Patient, QueueSettings, QueueState } from "@queue-cure/shared";
import type { Server } from "socket.io";
export declare function emitQueueState(io: Server, queueState: QueueState): void;
export declare function emitQueueReset(io: Server, queueState: QueueState, metadata: {
    resetTimestamp: string;
    totalPatientsRemoved: number;
    totalAppointmentsCleared: number;
}): void;
export declare function emitPatientAdded(io: Server, patient: Patient, queueState: QueueState): void;
export declare function emitTokenCalled(io: Server, patient: Patient, queueState: QueueState): void;
export declare function emitSettingsUpdated(io: Server, settings: QueueSettings, queueState: QueueState): void;
