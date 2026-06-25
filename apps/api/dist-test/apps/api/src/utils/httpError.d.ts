export declare class HttpError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string);
}
export declare function isHttpError(error: unknown): error is HttpError;
