import type {
  CreatePatientInput,
  Patient,
  PatientQueueView,
  QueueState,
} from "@queue-cure/shared";
import {
  createPatient,
  findPatientByToken,
  listPatients,
  updatePatientStatus,
} from "../repositories/patientRepository";
import {
  getSettings,
  updateSettings as persistSettings,
} from "../repositories/settingsRepository";
import { HttpError } from "../utils/httpError";
import { getAnalytics } from "./waitTimeService";
import {
  assertQueueIsCallable,
  buildTimeline,
  getAuditLogs,
  getDoctors,
  getPausedDoctorIds,
  predictWaitTimes,
} from "./platformService";

export async function getQueueState(): Promise<QueueState> {
  const [patients, settings, doctors, auditLogs] = await Promise.all([
    listPatients(),
    getSettings(),
    getDoctors(),
    getAuditLogs(),
  ]);
  const pausedDoctorIds = getPausedDoctorIds();
  const activeDoctorIds = doctors
    .filter(
      (doctor) =>
        doctor.availability === "available" &&
        !pausedDoctorIds.includes(doctor.id),
    )
    .map((doctor) => doctor.id);
  const waitingPatients = patients
    .filter(
      (patient) =>
        patient.status === "waiting" &&
        !pausedDoctorIds.includes(patient.doctorId) &&
        activeDoctorIds.includes(patient.doctorId),
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  const completedPatients = patients.filter(
    (patient) => patient.status === "completed",
  );
  const currentTokens = patients.filter(
    (patient) => patient.status === "serving",
  );
  const currentToken = currentTokens[0] ?? null;
  const appointmentPatients = patients
    .filter((patient) => Boolean(patient.appointmentTime))
    .sort((a, b) => {
      const aTime = a.appointmentTime
        ? new Date(a.appointmentTime).getTime()
        : 0;
      const bTime = b.appointmentTime
        ? new Date(b.appointmentTime).getTime()
        : 0;
      return aTime - bTime;
    });
  const timeline = buildTimeline(waitingPatients, settings.avgConsultationTime);

  return {
    patients,
    currentToken,
    currentTokens,
    waitingPatients,
    completedPatients,
    doctors,
    appointmentPatients,
    pausedDoctorIds,
    auditLogs,
    timeline,
    predictions: predictWaitTimes(
      waitingPatients,
      settings.avgConsultationTime,
      activeDoctorIds.length,
    ),
    settings,
    analytics: getAnalytics(patients, settings),
    updatedAt: new Date().toISOString(),
  };
}

export async function addPatient(input: CreatePatientInput): Promise<Patient> {
  const doctors = await getDoctors();
  const doctor =
    doctors.find((item) => item.id === input.doctorId) ?? doctors[0];
  const patient = await createPatient({
    ...input,
    doctorId: doctor?.id ?? input.doctorId,
    doctorName: doctor?.name ?? input.doctorName,
    room: doctor?.room ?? input.room,
  });
  const { addAuditLog } = await import("../repositories/platformRepository");
  await addAuditLog("patient.created", "patient", patient.id, { ...patient });
  return patient;
}

export async function callNextToken(doctorId?: string): Promise<Patient> {
  assertQueueIsCallable(doctorId);
  const patients = await listPatients();
  const activePatient = patients.find(
    (patient) =>
      patient.status === "serving" &&
      (!doctorId || patient.doctorId === doctorId),
  );

  if (activePatient) {
    throw new HttpError(409, "This doctor already has an active consultation.");
  }

  const pausedDoctorIds = getPausedDoctorIds();
  const nextPatient = patients.find(
    (patient) =>
      patient.status === "waiting" &&
      !pausedDoctorIds.includes(patient.doctorId) &&
      (!doctorId || patient.doctorId === doctorId),
  );

  if (!nextPatient) {
    throw new HttpError(409, "There are no waiting patients to call.");
  }

  const patient = await updatePatientStatus(nextPatient.id, "serving");
  const { addAuditLog } = await import("../repositories/platformRepository");
  await addAuditLog("patient.called", "patient", patient.id, {
    tokenNumber: patient.tokenNumber,
    doctorId: patient.doctorId,
  });
  return patient;
}

export async function completeConsultation(doctorId: string): Promise<{
  completedPatient: Patient;
  nextPatient: Patient | null;
}> {
  const patients = await listPatients();
  const activePatient = patients.find(
    (patient) => patient.doctorId === doctorId && patient.status === "serving",
  );

  if (!activePatient) {
    throw new HttpError(
      409,
      "This doctor has no active consultation to complete.",
    );
  }

  const completedPatient = await updatePatientStatus(
    activePatient.id,
    "completed",
  );
  const { addAuditLog } = await import("../repositories/platformRepository");
  await addAuditLog("patient.completed", "patient", completedPatient.id, {
    tokenNumber: completedPatient.tokenNumber,
    doctorId: completedPatient.doctorId,
    consultationStartTime: completedPatient.consultationStartTime,
    consultationEndTime: completedPatient.consultationEndTime,
  });

  const refreshedPatients = await listPatients();
  const nextWaitingPatient = refreshedPatients
    .filter(
      (patient) =>
        patient.doctorId === doctorId && patient.status === "waiting",
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber)[0];

  if (!nextWaitingPatient) {
    return { completedPatient, nextPatient: null };
  }

  const nextPatient = await updatePatientStatus(
    nextWaitingPatient.id,
    "serving",
  );
  await addAuditLog("patient.called", "patient", nextPatient.id, {
    tokenNumber: nextPatient.tokenNumber,
    doctorId: nextPatient.doctorId,
    autoStartedAfterCompletion: true,
  });

  return { completedPatient, nextPatient };
}

export async function updateSettings(avgConsultationTime: number) {
  return persistSettings(avgConsultationTime);
}

export async function getPatientQueueView(
  tokenNumber: number,
): Promise<PatientQueueView> {
  const [queueState, patient] = await Promise.all([
    getQueueState(),
    findPatientByToken(tokenNumber),
  ]);

  if (!patient) {
    throw new HttpError(404, "No patient found for that token number.");
  }

  const doctorQueue = queueState.patients
    .filter(
      (item) => item.doctorId === patient.doctorId && item.status === "waiting",
    )
    .sort((a, b) => a.tokenNumber - b.tokenNumber);
  const waitingIndex = doctorQueue.findIndex((item) => item.id === patient.id);
  const queuePosition = waitingIndex >= 0 ? waitingIndex + 1 : null;
  const tokensAhead = queuePosition ? queuePosition - 1 : 0;
  const estimatedWaitTime =
    tokensAhead * queueState.settings.avgConsultationTime;

  const statusMessage =
    patient.status === "serving"
      ? "Your token is being served now."
      : patient.status === "completed"
        ? "Your consultation is complete."
        : "You are in the waiting queue.";

  return {
    patient,
    currentToken:
      queueState.currentTokens.find(
        (item) => item.doctorId === patient.doctorId,
      )?.tokenNumber ?? null,
    currentServingPatient:
      queueState.currentTokens.find(
        (item) => item.doctorId === patient.doctorId,
      ) ?? null,
    tokensAhead,
    estimatedWaitTime,
    queuePosition,
    statusMessage,
  };
}
