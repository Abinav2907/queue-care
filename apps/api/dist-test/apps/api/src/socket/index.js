import { Server } from "socket.io";
import { env } from "../config/env";
import { registerSocketHandlers } from "./handlers";
export function createSocketServer(server) {
    const io = new Server(server, {
        cors: {
            origin: env.allowedOrigins,
            methods: ["GET", "POST", "PATCH"]
        }
    });
    registerSocketHandlers(io);
    return io;
}
//# sourceMappingURL=index.js.map