import type { Patient, QueueAnalytics, QueueSettings } from "@queue-cure/shared";

function getPriorityWeight(patient: Patient): number {
  if (patient.priority === "emergency") return 0;
  if (patient.priority === "urgent" || patient.priority === "priority") return 0.75;
  return 1;
}

export function getTokensAhead(patients: Patient[], tokenNumber: number): number {
  const patient = patients.find((item) => item.tokenNumber === tokenNumber);
  if (!patient) return 0;

  return patients.filter(
    (item) =>
      item.doctorId === patient.doctorId &&
      (item.status === "serving" ||
        (item.status === "waiting" && item.tokenNumber < tokenNumber))
  ).length;
}

export function estimateWaitTime(tokensAhead: number, settings: QueueSettings): number {
  return Math.max(0, tokensAhead * settings.avgConsultationTime);
}

function estimatePatientWaitTime(
  patients: Patient[],
  patient: Patient,
  settings: QueueSettings
): number {
  if (patient.priority === "emergency") return 0;

  const patientsAhead = patients.filter(
    (item) =>
      item.doctorId === patient.doctorId &&
      (item.status === "serving" ||
        (item.status === "waiting" && item.tokenNumber < patient.tokenNumber))
  );

  return Math.max(
    0,
    Math.round(
      patientsAhead.reduce(
        (sum, item) => sum + settings.avgConsultationTime * getPriorityWeight(item),
        0
      )
    )
  );
}

export function getAverageWait(patients: Patient[], settings: QueueSettings): number {
  const waitingPatients = patients.filter((patient) => patient.status === "waiting");
  if (!waitingPatients.length) return 0;

  const total = waitingPatients.reduce((sum, patient) => {
    return sum + estimatePatientWaitTime(patients, patient, settings);
  }, 0);

  return Math.round(total / waitingPatients.length);
}

export function getAnalytics(patients: Patient[], settings: QueueSettings): QueueAnalytics {
  return {
    totalWaiting: patients.filter((patient) => patient.status === "waiting").length,
    patientsServed: patients.filter((patient) => patient.status === "completed").length,
    averageWait: getAverageWait(patients, settings)
  };
}
