import { Router } from "express";
import { callNextController, completeConsultationController, appointmentsController, auditLogsController, createAppointmentController, getActiveTokenController, getAnalyticsController, getDoctorsController, getQueueController, getSettingsController, notificationsController, pauseQueueController, resumeQueueController, syncQueueController, updateDoctorController, updateSettingsController } from "../controllers/queueController";
import { getPatientByTokenController } from "../controllers/patientController";
export const queueRoutes = Router();
queueRoutes.get("/", (req, res, next) => {
    getQueueController(req, res).catch(next);
});
queueRoutes.get("/active-token", (req, res, next) => {
    getActiveTokenController(req, res).catch(next);
});
queueRoutes.get("/analytics", (req, res, next) => {
    getAnalyticsController(req, res).catch(next);
});
queueRoutes.get("/settings", (req, res, next) => {
    getSettingsController(req, res).catch(next);
});
queueRoutes.get("/doctors", (req, res, next) => {
    getDoctorsController(req, res).catch(next);
});
queueRoutes.patch("/doctors/:doctorId", (req, res, next) => {
    updateDoctorController(req, res).catch(next);
});
queueRoutes.post("/doctors/:doctorId/pause", (req, res, next) => {
    pauseQueueController(req, res).catch(next);
});
queueRoutes.post("/doctors/:doctorId/resume", (req, res, next) => {
    resumeQueueController(req, res).catch(next);
});
queueRoutes.post("/doctors/:doctorId/complete", (req, res, next) => {
    completeConsultationController(req, res).catch(next);
});
queueRoutes.get("/appointments", (req, res, next) => {
    appointmentsController(req, res).catch(next);
});
queueRoutes.post("/appointments", (req, res, next) => {
    createAppointmentController(req, res).catch(next);
});
queueRoutes.get("/audit-logs", (req, res, next) => {
    auditLogsController(req, res).catch(next);
});
queueRoutes.post("/notifications", (req, res, next) => {
    notificationsController(req, res).catch(next);
});
queueRoutes.get("/patient/:tokenNumber", (req, res, next) => {
    getPatientByTokenController(req, res).catch(next);
});
queueRoutes.post("/call-next", (req, res, next) => {
    callNextController(req, res).catch(next);
});
queueRoutes.post("/", (req, res, next) => {
    if (req.baseUrl.endsWith("/call-next")) {
        callNextController(req, res).catch(next);
        return;
    }
    syncQueueController(req, res).catch(next);
});
queueRoutes.patch("/settings", (req, res, next) => {
    updateSettingsController(req, res).catch(next);
});
queueRoutes.post("/sync", (req, res, next) => {
    syncQueueController(req, res).catch(next);
});
//# sourceMappingURL=queueRoutes.js.map