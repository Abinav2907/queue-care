import cron from "node-cron";
import type { Server } from "socket.io";
import { emitQueueReset } from "../events/queueEvents.js";
import { resetQueueForNewDay } from "../services/queueService.js";

export function startDailyQueueResetJob(io: Server): void {
  cron.schedule("0 0 * * *", async () => {
    try {
      const result = await resetQueueForNewDay();
      emitQueueReset(io, result.queueState, {
        resetTimestamp: result.resetTimestamp,
        totalPatientsRemoved: result.totalPatientsRemoved,
        totalAppointmentsCleared: result.totalAppointmentsCleared,
      });
    } catch (error) {
      io.emit("queue:error", {
        message: error instanceof Error ? error.message : "Daily queue reset failed",
      });
      console.error("Daily queue reset failed", error);
    }
  });
}
