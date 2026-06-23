import { Router } from "express";
import { createPatientController } from "../controllers/patientController";

export const patientRoutes = Router();

patientRoutes.post("/", (req, res, next) => {
  createPatientController(req, res).catch(next);
});
