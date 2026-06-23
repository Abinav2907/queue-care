import { SOCKET_EVENTS } from "@queue-cure/shared";
import type { Server } from "socket.io";
import { getQueueState } from "../services/queueService";

export function registerSocketHandlers(io: Server): void {
  io.on("connection", async (socket) => {
    socket.emit(SOCKET_EVENTS.QUEUE_STATE, await getQueueState());

    socket.on("queue:sync", async () => {
      socket.emit(SOCKET_EVENTS.QUEUE_STATE, await getQueueState());
    });
  });
}
