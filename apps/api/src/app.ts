import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { healthRoutes } from "./routes/healthRoutes";
import { patientRoutes } from "./routes/patientRoutes";
import { queueRoutes } from "./routes/queueRoutes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json());

  app.use("/health", healthRoutes);
  app.use("/patients", patientRoutes);
  app.use("/queue", queueRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
