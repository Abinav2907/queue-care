import { appointmentSchema, notificationSchema, SOCKET_EVENTS, updateDoctorSchema, updateSettingsSchema } from "@queue-cure/shared";
import { emitQueueState, emitSettingsUpdated, emitTokenCalled } from "../events/queueEvents";
import { addPatient, callNextToken, completeConsultation, getQueueState, updateSettings } from "../services/queueService";
import { getAuditLogs, getDoctors, notifyPatient, pauseQueue, resumeQueue, setDoctorAvailability } from "../services/platformService";
import { HttpError } from "../utils/httpError";
export async function getQueueController(_req, res) {
    res.json(await getQueueState());
}
export async function getActiveTokenController(_req, res) {
    const queueState = await getQueueState();
    res.json({
        currentToken: queueState.currentToken,
        tokenNumber: queueState.currentToken?.tokenNumber ?? null
    });
}
export async function getAnalyticsController(_req, res) {
    const queueState = await getQueueState();
    res.json(queueState.analytics);
}
export async function getSettingsController(_req, res) {
    const queueState = await getQueueState();
    res.json(queueState.settings);
}
export async function callNextController(req, res) {
    const doctorId = typeof req.query.doctorId === "string" ? req.query.doctorId : undefined;
    if (!doctorId)
        throw new HttpError(400, "doctorId is required to call the next token.");
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
export async function completeConsultationController(req, res) {
    const doctorId = req.params.doctorId;
    if (!doctorId)
        throw new HttpError(400, "Doctor id is required.");
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
export async function updateSettingsController(req, res) {
    const input = updateSettingsSchema.parse(req.body);
    const settings = await updateSettings(input.avgConsultationTime);
    const queueState = await getQueueState();
    req.app.locals.io && emitSettingsUpdated(req.app.locals.io, settings, queueState);
    res.json({ settings, queueState });
}
export async function syncQueueController(req, res) {
    const queueState = await getQueueState();
    req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
    res.json(queueState);
}
export async function getDoctorsController(_req, res) {
    res.json(await getDoctors());
}
export async function updateDoctorController(req, res) {
    const doctorId = req.params.doctorId;
    if (!doctorId)
        throw new HttpError(400, "Doctor id is required.");
    const input = updateDoctorSchema.parse(req.body);
    if (!input.availability)
        throw new HttpError(400, "Doctor availability is required.");
    const doctor = await setDoctorAvailability(doctorId, input.availability);
    const queueState = await getQueueState();
    req.app.locals.io?.emit(SOCKET_EVENTS.DOCTOR_UPDATED, doctor);
    req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
    res.json({ doctor, queueState });
}
export async function pauseQueueController(req, res) {
    const doctorId = req.params.doctorId;
    if (!doctorId)
        throw new HttpError(400, "Doctor id is required.");
    await pauseQueue(doctorId);
    const queueState = await getQueueState();
    req.app.locals.io?.emit(SOCKET_EVENTS.QUEUE_PAUSED, { doctorId });
    req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
    res.json(queueState);
}
export async function resumeQueueController(req, res) {
    const doctorId = req.params.doctorId;
    if (!doctorId)
        throw new HttpError(400, "Doctor id is required.");
    await resumeQueue(doctorId);
    const queueState = await getQueueState();
    req.app.locals.io?.emit(SOCKET_EVENTS.QUEUE_RESUMED, { doctorId });
    req.app.locals.io && emitQueueState(req.app.locals.io, queueState);
    res.json(queueState);
}
export async function appointmentsController(_req, res) {
    const queueState = await getQueueState();
    res.json(queueState.appointmentPatients);
}
export async function createAppointmentController(req, res) {
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
export async function auditLogsController(_req, res) {
    res.json(await getAuditLogs());
}
export async function notificationsController(req, res) {
    const input = notificationSchema.parse(req.body);
    const receipt = await notifyPatient(input);
    req.app.locals.io?.emit(SOCKET_EVENTS.NOTIFICATION_QUEUED, receipt);
    res.status(202).json(receipt);
}
//# sourceMappingURL=queueController.js.map