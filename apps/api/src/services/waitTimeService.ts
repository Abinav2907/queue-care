import type { Patient, QueueAnalytics, QueueSettings } from "@queue-cure/shared";

export function getTokensAhead(patients: Patient[], tokenNumber: number): number {
  return patients.filter(
    (patient) => patient.status === "waiting" && patient.tokenNumber < tokenNumber
  ).length;
}

export function estimateWaitTime(tokensAhead: number, settings: QueueSettings): number {
  return Math.max(0, tokensAhead * settings.avgConsultationTime);
}

export function getAverageWait(patients: Patient[], settings: QueueSettings): number {
  const waitingPatients = patients.filter((patient) => patient.status === "waiting");
  if (!waitingPatients.length) return 0;

  const total = waitingPatients.reduce((sum, patient) => {
    return sum + estimateWaitTime(getTokensAhead(patients, patient.tokenNumber), settings);
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
