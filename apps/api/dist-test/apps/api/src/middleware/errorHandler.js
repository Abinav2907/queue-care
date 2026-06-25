import { ZodError } from "zod";
import { isHttpError } from "../utils/httpError";
export function errorHandler(error, _req, res, _next) {
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
//# sourceMappingURL=errorHandler.js.map