import { Request, Response } from "express";
import { createResponse } from "../../logs/helpers/response";

// Reusable function to validate pagination parameters with dynamic default values
const validatePagination = (
    req: Request,
    res: Response,
    defaultPage: number = 1,  // Default page value (if not provided in query)
    defaultLimit: number = 10  // Default limit value (if not provided in query)
): { page: number; limit: number } | undefined => {
    const page = parseInt(req.query.page as string, 10) || defaultPage;
    const limit = parseInt(req.query.limit as string, 10) || defaultLimit;

    if (isNaN(page) || page < 1) {
        res.status(400).json(createResponse(false, 'Invalid page number, should start with 1'));
        return undefined;
    }

    if (isNaN(limit) || limit < 1) {
        res.status(400).json(createResponse(false, 'Invalid limit number, should be at least 1'));
        return undefined;
    }

    return { page, limit };
};

export default validatePagination;
