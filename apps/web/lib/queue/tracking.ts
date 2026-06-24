import type { PatientQueueView, QueueState } from "@queue-cure/shared";

function getPriorityWeight(priority: string): number {
  if (priority === "emergency") return 0;
  if (priority === "urgent" || priority === "priority") return 0.75;
  return 1;
}

export function buildPatientTrackingView(
  queueState: QueueState,
  tokenNumber: number
): PatientQueueView | null {
  const patient = queueState.patients.find((item) => item.tokenNumber === tokenNumber);

  if (!patient) return null;

  const doctorQueue = queueState.patients
    .filter(
      (item) =>
        item.doctorId === patient.doctorId &&
        (item.status === "serving" || item.status === "waiting")
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  const patientIndex = doctorQueue.findIndex((item) => item.id === patient.id);
  const queuePosition =
    patient.status === "waiting" && patientIndex >= 0 ? patientIndex + 1 : null;
  const tokensAhead =
    patient.status === "waiting" && patientIndex >= 0 ? patientIndex : 0;
  const estimatedWaitTime =
    patient.status === "waiting" && patient.priority !== "emergency"
      ? Math.max(
          0,
          Math.round(
            doctorQueue
              .filter(
                (item) =>
                  item.id !== patient.id &&
                  (item.status === "serving" ||
                    (item.status === "waiting" && item.tokenNumber < patient.tokenNumber))
              )
              .reduce(
                (total, item) =>
                  total + queueState.settings.avgConsultationTime * getPriorityWeight(item.priority),
                0
              )
          )
        )
      : 0;
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
