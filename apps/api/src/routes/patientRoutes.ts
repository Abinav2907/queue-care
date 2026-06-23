import { Router, type Router as ExpressRouter } from "express";
import {
  createPatientController,
  getPatientByTokenController,
  listPatientsController
} from "../controllers/patientController";

export const patientRoutes: ExpressRouter = Router();

patientRoutes.get("/", (req, res, next) => {
  listPatientsController(req, res).catch(next);
});

patientRoutes.get("/token/:tokenNumber", (req, res, next) => {
  getPatientByTokenController(req, res).catch(next);
});

patientRoutes.post("/", (req, res, next) => {
  createPatientController(req, res).catch(next);
});
