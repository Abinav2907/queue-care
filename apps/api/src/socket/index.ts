import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { registerSocketHandlers } from "./handlers";

export function createSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ["GET", "POST", "PATCH"]
    }
  });

  registerSocketHandlers(io);
  return io;
}
