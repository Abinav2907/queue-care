import { SOCKET_EVENTS } from "@queue-cure/shared";
import type { Server } from "socket.io";
import { getQueueState } from "../services/queueService";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", async (socket) => {
    try {
      socket.emit(SOCKET_EVENTS.QUEUE_STATE, await getQueueState());
    } catch (error) {
      socket.emit("queue:error", {
        message: error instanceof Error ? error.message : "Unable to load queue state"
      });
    }

    socket.on("queue:sync", async () => {
      try {
        socket.emit(SOCKET_EVENTS.QUEUE_STATE, await getQueueState());
      } catch (error) {
        socket.emit("queue:error", {
          message: error instanceof Error ? error.message : "Unable to sync queue state"
        });
      }
    });
  });
}
