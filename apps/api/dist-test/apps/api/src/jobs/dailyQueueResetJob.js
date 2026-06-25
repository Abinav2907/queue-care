import cron from "node-cron";
import { emitQueueReset } from "../events/queueEvents";
import { resetQueueForNewDay } from "../services/queueService";
export function startDailyQueueResetJob(io) {
    cron.schedule("0 0 * * *", async () => {
        try {
            const result = await resetQueueForNewDay();
            emitQueueReset(io, result.queueState, {
                resetTimestamp: result.resetTimestamp,
                totalPatientsRemoved: result.totalPatientsRemoved,
                totalAppointmentsCleared: result.totalAppointmentsCleared,
            });
        }
        catch (error) {
            io.emit("queue:error", {
                message: error instanceof Error ? error.message : "Daily queue reset failed",
            });
            console.error("Daily queue reset failed", error);
        }
    });
}
//# sourceMappingURL=dailyQueueResetJob.js.map