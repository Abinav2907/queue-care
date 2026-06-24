import type { Patient, QueueSettings, QueueState } from "@queue-cure/shared";
import { SOCKET_EVENTS } from "@queue-cure/shared";
import type { Server } from "socket.io";

export function emitQueueState(io: Server, queueState: QueueState): void {
  io.emit(SOCKET_EVENTS.QUEUE_UPDATED, queueState);
  io.emit(SOCKET_EVENTS.QUEUE_STATE, queueState);
}

export function emitQueueReset(
  io: Server,
  queueState: QueueState,
  metadata: {
    resetTimestamp: string;
    totalPatientsRemoved: number;
    totalAppointmentsCleared: number;
  }
): void {
  io.emit(SOCKET_EVENTS.QUEUE_RESET, { ...metadata, queueState });
  emitQueueState(io, queueState);
}

export function emitPatientAdded(io: Server, patient: Patient, queueState: QueueState): void {
  io.emit(SOCKET_EVENTS.PATIENT_ADDED, patient);
  emitQueueState(io, queueState);
}

export function emitTokenCalled(io: Server, patient: Patient, queueState: QueueState): void {
  io.emit(SOCKET_EVENTS.TOKEN_CALLED, patient);
  emitQueueState(io, queueState);
}

export function emitSettingsUpdated(
  io: Server,
  settings: QueueSettings,
  queueState: QueueState
): void {
  io.emit(SOCKET_EVENTS.SETTINGS_UPDATED, settings);
  emitQueueState(io, queueState);
}
