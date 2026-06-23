import { Router } from "express";
import {
  callNextController,
  getQueueController,
  syncQueueController,
  updateSettingsController
} from "../controllers/queueController";

export const queueRoutes = Router();

queueRoutes.get("/", (req, res, next) => {
  getQueueController(req, res).catch(next);
});

queueRoutes.post("/call-next", (req, res, next) => {
  callNextController(req, res).catch(next);
});

queueRoutes.patch("/settings", (req, res, next) => {
  updateSettingsController(req, res).catch(next);
});

queueRoutes.post("/sync", (req, res, next) => {
  syncQueueController(req, res).catch(next);
});
