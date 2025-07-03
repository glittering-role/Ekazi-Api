import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../types/interfaces/schema/interfaces.schema";
import { createResponse } from "../logs/helpers/response";

/**
 * @desc Handles async functions by wrapping them in a try/catch block
 * and passing errors to the error handling middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: ApiError) => {
      // If headers have already been sent, delegate to the next error handler.
      if (res.headersSent) {
        return next(error);
      }

      // Construct the error message and status code for the response
      const errorMessage = error.message || "An unexpected error occurred";
      const statusCode = error.statusCode || 500;

      // Return an error response using createResponse
      const response = createResponse(false, errorMessage, { statusCode });

      // Send the response with the appropriate status code and response data
      res.status(statusCode).json(response);
    });
  };
};
