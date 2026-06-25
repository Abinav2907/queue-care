import http from "node:http";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { startDailyQueueResetJob } from "./jobs/dailyQueueResetJob.js";
import { createSocketServer } from "./socket/index.js";

const app = createApp();
const server = http.createServer(app);
const io = createSocketServer(server);

app.locals.io = io;
startDailyQueueResetJob(io);

server.listen(env.port, () => {
  console.log(`Queue Cure API listening on http://localhost:${env.port}`);
});
