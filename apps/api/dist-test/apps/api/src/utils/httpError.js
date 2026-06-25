export class HttpError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
export function isHttpError(error) {
    return error instanceof HttpError;
}
//# sourceMappingURL=httpError.js.map