import { SOCKET_EVENTS } from "@queue-cure/shared";
export function emitQueueState(io, queueState) {
    io.emit(SOCKET_EVENTS.QUEUE_UPDATED, queueState);
    io.emit(SOCKET_EVENTS.QUEUE_STATE, queueState);
}
export function emitQueueReset(io, queueState, metadata) {
    io.emit(SOCKET_EVENTS.QUEUE_RESET, { ...metadata, queueState });
    emitQueueState(io, queueState);
}
export function emitPatientAdded(io, patient, queueState) {
    io.emit(SOCKET_EVENTS.PATIENT_ADDED, patient);
    emitQueueState(io, queueState);
}
export function emitTokenCalled(io, patient, queueState) {
    io.emit(SOCKET_EVENTS.TOKEN_CALLED, patient);
    emitQueueState(io, queueState);
}
export function emitSettingsUpdated(io, settings, queueState) {
    io.emit(SOCKET_EVENTS.SETTINGS_UPDATED, settings);
    emitQueueState(io, queueState);
}
//# sourceMappingURL=queueEvents.js.map