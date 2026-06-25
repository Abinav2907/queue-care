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
    app.use(cors({
        origin(origin, callback) {
            if (!origin || env.allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }
            callback(new Error(`CORS blocked origin: ${origin}`));
        },
        credentials: true
    }));
    app.use(express.json());
    app.get("/", (_req, res) => {
        res.json({
            ok: true,
            service: "queue-cure-api",
            routes: ["/api/health", "/api/queue", "/api/patients"]
        });
    });
    app.use("/api/health", healthRoutes);
    app.use("/api/patients", patientRoutes);
    app.use("/api/patient", patientRoutes);
    app.use("/api/queue", queueRoutes);
    app.use("/api/call-next", queueRoutes);
    app.use("/health", healthRoutes);
    app.use("/patients", patientRoutes);
    app.use("/patient", patientRoutes);
    app.use("/queue", queueRoutes);
    app.use(notFound);
    app.use(errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map