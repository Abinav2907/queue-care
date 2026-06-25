import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
export declare function createSocketServer(server: HttpServer): Server;
