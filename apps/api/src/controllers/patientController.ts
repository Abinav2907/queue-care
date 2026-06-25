import { createPatientSchema } from "@queue-cure/shared";
import type { Request, Response } from "express";
import { emitPatientAdded } from "../events/queueEvents.js";
import { addPatient, getPatientQueueView, getQueueState } from "../services/queueService.js";
import { HttpError } from "../utils/httpError.js";

export async function listPatientsController(_req: Request, res: Response): Promise<void> {
  const queueState = await getQueueState();
  res.json({
    patients: queueState.patients,
    waitingPatients: queueState.waitingPatients,
    currentToken: queueState.currentToken,
    completedPatients: queueState.completedPatients
  });
}

export async function createPatientController(req: Request, res: Response): Promise<void> {
  const input = createPatientSchema.parse(req.body);
  const patient = await addPatient(input);
  const queueState = await getQueueState();

  req.app.locals.io && emitPatientAdded(req.app.locals.io, patient, queueState);
  res.status(201).json({ patient, queueState });
}

export async function getPatientByTokenController(req: Request, res: Response): Promise<void> {
  const tokenNumber = Number(req.params.tokenNumber);

  if (!Number.isInteger(tokenNumber) || tokenNumber < 1) {
    throw new HttpError(400, "Token number must be a positive integer.");
  }

  const tracking = await getPatientQueueView(tokenNumber);
  res.json(tracking);
}
