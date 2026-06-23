import { Router } from "express";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "queue-cure-api",
    timestamp: new Date().toISOString()
  });
});
