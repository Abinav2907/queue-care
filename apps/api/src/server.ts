import http from "node:http";
import { env } from "./config/env";
import { createApp } from "./app";
import { createSocketServer } from "./socket";

const app = createApp();
const server = http.createServer(app);
const io = createSocketServer(server);

app.locals.io = io;

server.listen(env.port, () => {
  console.log(`Queue Cure API listening on http://localhost:${env.port}`);
});
