import { createPatientSchema } from "@queue-cure/shared";
import type { Request, Response } from "express";
import { emitPatientAdded } from "../events/queueEvents";
import { addPatient, getQueueState } from "../services/queueService";

export async function createPatientController(req: Request, res: Response): Promise<void> {
  const input = createPatientSchema.parse(req.body);
  const patient = await addPatient(input);
  const queueState = await getQueueState();

  req.app.locals.io && emitPatientAdded(req.app.locals.io, patient, queueState);
  res.status(201).json({ patient, queueState });
}
