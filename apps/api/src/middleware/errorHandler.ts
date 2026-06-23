import { ZodError } from "zod";
import type { NextFunction, Request, Response } from "express";
import { isHttpError } from "../utils/httpError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request",
      issues: error.flatten().fieldErrors
    });
    return;
  }

  if (isHttpError(error)) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(500).json({ message });
}
