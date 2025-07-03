import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../helpers/response';
import logger from '../helpers/logger';

// Define the error handling middleware function with appropriate types
const errorHandlingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Log the error using the logger
  logger.error(`Unhandled error occurred: ${err.message}`, {
    route: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
  });

  // Respond with a generic error message
  res.status(500).json(createResponse(false, 'An unexpected error occurred'));
};

export default errorHandlingMiddleware;
