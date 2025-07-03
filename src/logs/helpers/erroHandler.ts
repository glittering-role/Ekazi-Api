import { Request, Response } from "express";
import logger from "./logger";

// Utility function for error logging and response
const handleError = (error: unknown, { method, originalUrl }: Request, res: Response, message: string): void => {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";

    logger.error(message, {
        method,
        route: originalUrl,
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
    });

    res.status(500).json({
        success: false,
        message,
    });
};

export { handleError };
