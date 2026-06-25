import {
  appointmentSchema,
  notificationSchema,
  SOCKET_EVENTS,
  updateDoctorSchema,
  updateSettingsSchema
} from "@queue-cure/shared";
import type { Request, Response } from "express";
import { emitQueueState, emitSettingsUpdated, emitTokenCalled } from "../events/queueEvents.js";
import {
  addPatient,
  callNextToken,
  completeConsultation,
  getQueueState,
  updateSettings
} from "../services/queueService.js";
import {
  getAuditLogs,
  getDoctors,
  notifyPatient,
  pauseQueue,
  resumeQueue,
  setDoctorAvailability
} from "../services/platformService.js";
import { HttpError } from "../utils/httpError.js";

export async function getQueueController(_req: Request, res: Response): Promise<void> {
  res.json(await getQueueState());
}

export async function getActiveTokenController(_req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  res.json({
    currentToken: queueState.currentToken,
    tokenNumber: queueState.currentToken?.tokenNumber ?? null
  });
}

export async function getAnalyticsController(_req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  res.json(queueState.analytics);
}

export async function getSettingsController(_req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  res.json(queueState.settings);
}

export async function callNextController(req: Request, res: Response): Promise<void> {
  const doctorId = typeof req.query.doctorId === "string" ? req.query.doctorId : undefined;
  if (!doctorId) throw new HttpError(400, "doctorId is required to call the next token.");
  const patient = await callNextToken(doctorId);
  const queueState = await getQueueState();

  if (req.app.locals.io) {
    emitTokenCalled(req.app.locals.io, patient, queueState);
    req.app.locals.io.emit(SOCKET_EVENTS.VOICE_ANNOUNCEMENT, {
      tokenNumber: patient.tokenNumber,
      message: `Token ${patient.tokenNumber}, please proceed to consultation.`
    });
  }
  res.json({ patient, queueState });
}

export async function completeConsultationController(req: Request, res: Response): Promise<void> {
  const doctorId = req.params.doctorId;
  if (!doctorId) throw new HttpError(400, "Doctor id is required.");

  const result = await completeConsultation(doctorId);
  const queueState = await getQueueState();

  if (req.app.locals.io) {
    emitQueueState(req.app.locals.io, queueState);
    if (result.nextPatient) {
      emitTokenCalled(req.app.locals.io, result.nextPatient, queueState);
      req.app.locals.io.emit(SOCKET_EVENTS.VOICE_ANNOUNCEMENT, {
        tokenNumber: result.nextPatient.tokenNumber,
        message: `Token ${result.nextPatient.tokenNumber}, please proceed to consultation.`
      });
    }
  }

  res.json({ ...result, queueState });
}

export async function updateSettingsController(req: Request, res: Response): Promise<void> {
  const input = updateSettingsSchema.parse(req.body);
  const settings = await updateSettings(input.avgConsultationTime);
  const queueState = await getQueueState();

  req.app.locals.io && emitSettingsUpdated(req.app.locals.io, settings, queueState);
  res.json({ settings, queueState });
}

export async function syncQueueController(req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
  res.json(queueState);
}

export async function getDoctorsController(_req: Request, res: Response): Promise<void> {
  res.json(await getDoctors());
}

export async function updateDoctorController(req: Request, res: Response): Promise<void> {
  const doctorId = req.params.doctorId;
  if (!doctorId) throw new HttpError(400, "Doctor id is required.");
  const input = updateDoctorSchema.parse(req.body);
  if (!input.availability) throw new HttpError(400, "Doctor availability is required.");
  const doctor = await setDoctorAvailability(doctorId, input.availability);
  const queueState = await getQueueState();
  req.app.locals.io?.emit(SOCKET_EVENTS.DOCTOR_UPDATED, doctor);
  req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
  res.json({ doctor, queueState });
}

export async function pauseQueueController(req: Request, res: Response): Promise<void> {
  const doctorId = req.params.doctorId;
  if (!doctorId) throw new HttpError(400, "Doctor id is required.");
  await pauseQueue(doctorId);
  const queueState = await getQueueState();
  req.app.locals.io?.emit(SOCKET_EVENTS.QUEUE_PAUSED, { doctorId });
  req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
  res.json(queueState);
}

export async function resumeQueueController(req: Request, res: Response): Promise<void> {
  const doctorId = req.params.doctorId;
  if (!doctorId) throw new HttpError(400, "Doctor id is required.");
  await resumeQueue(doctorId);
  const queueState = await getQueueState();
  req.app.locals.io?.emit(SOCKET_EVENTS.QUEUE_RESUMED, { doctorId });
  req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
  res.json(queueState);
}

export async function appointmentsController(_req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  res.json(queueState.appointmentPatients);
}

export async function createAppointmentController(req: Request, res: Response): Promise<void> {
  const input = appointmentSchema.parse(req.body);
  const patient = await addPatient({
    patientName: input.patientName,
    doctorId: input.doctorId,
    appointmentTime: input.scheduledAt,
    phoneNumber: input.phoneNumber,
    priority: input.priority ?? "normal"
  });
  const queueState = await getQueueState();
  req.app.locals.io?.emit(SOCKET_EVENTS.APPOINTMENT_CREATED, patient);
  req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
  res.status(201).json({ patient, queueState });
}

export async function auditLogsController(_req: Request, res: Response): Promise<void> {
  res.json(await getAuditLogs());
}

export async function notificationsController(req: Request, res: Response): Promise<void> {
  const input = notificationSchema.parse(req.body);
  const receipt = await notifyPatient(input);
  req.app.locals.io?.emit(SOCKET_EVENTS.NOTIFICATION_QUEUED, receipt);
  res.status(202).json(receipt);
}
