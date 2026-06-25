import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { registerSocketHandlers } from "./handlers.js";

export function createSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: env.allowedOrigins,
      methods: ["GET", "POST", "PATCH"]
    }
  });

  registerSocketHandlers(io);
  return io;
}
