import { createPatientSchema } from "@queue-cure/shared";
import { emitPatientAdded } from "../events/queueEvents";
import { addPatient, getPatientQueueView, getQueueState } from "../services/queueService";
import { HttpError } from "../utils/httpError";
export async function listPatientsController(_req, res) {
    const queueState = await getQueueState();
    res.json({
        patients: queueState.patients,
        waitingPatients: queueState.waitingPatients,
        currentToken: queueState.currentToken,
        completedPatients: queueState.completedPatients
    });
}
export async function createPatientController(req, res) {
    const input = createPatientSchema.parse(req.body);
    const patient = await addPatient(input);
    const queueState = await getQueueState();
    req.app.locals.io && emitPatientAdded(req.app.locals.io, patient, queueState);
    res.status(201).json({ patient, queueState });
}
export async function getPatientByTokenController(req, res) {
    const tokenNumber = Number(req.params.tokenNumber);
    if (!Number.isInteger(tokenNumber) || tokenNumber < 1) {
        throw new HttpError(400, "Token number must be a positive integer.");
    }
    const tracking = await getPatientQueueView(tokenNumber);
    res.json(tracking);
}
//# sourceMappingURL=patientController.js.map