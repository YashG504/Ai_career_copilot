/**
 * Custom application error with HTTP status code.
 * Used to throw operational errors that the global error handler can format.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}
