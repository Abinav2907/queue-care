import type { PatientQueueView, QueueState } from "@queue-cure/shared";

export function buildPatientTrackingView(
  queueState: QueueState,
  tokenNumber: number
): PatientQueueView | null {
  const patient = queueState.patients.find((item) => item.tokenNumber === tokenNumber);

  if (!patient) return null;

  const doctorQueue = queueState.patients.filter(
    (item) => item.doctorId === patient.doctorId && item.status === "waiting"
  );
  const waitingIndex = doctorQueue.findIndex((item) => item.id === patient.id);
  const queuePosition = waitingIndex >= 0 ? waitingIndex + 1 : null;
  const tokensAhead = queuePosition ? queuePosition - 1 : 0;
  const estimatedWaitTime = tokensAhead * queueState.settings.avgConsultationTime;
  const currentServingPatient =
    queueState.currentTokens.find((item) => item.doctorId === patient.doctorId) ?? null;

  const statusMessage =
    patient.status === "serving"
      ? "Your token is being served now."
      : patient.status === "completed"
        ? "Your consultation is complete."
        : "You are in the waiting queue.";

  return {
    patient,
    currentToken: currentServingPatient?.tokenNumber ?? null,
    currentServingPatient,
    tokensAhead,
    estimatedWaitTime,
    queuePosition,
    statusMessage
  };
}
