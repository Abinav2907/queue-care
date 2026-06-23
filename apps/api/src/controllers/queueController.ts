import { updateSettingsSchema } from "@queue-cure/shared";
import type { Request, Response } from "express";
import { emitQueueState, emitSettingsUpdated, emitTokenCalled } from "../events/queueEvents";
import { callNextToken, getQueueState, updateSettings } from "../services/queueService";

export async function getQueueController(_req: Request, res: Response): Promise<void> {
  res.json(await getQueueState());
}

export async function callNextController(req: Request, res: Response): Promise<void> {
  const patient = await callNextToken();
  const queueState = await getQueueState();

  req.app.locals.io && emitTokenCalled(req.app.locals.io, patient, queueState);
  res.json({ patient, queueState });
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
