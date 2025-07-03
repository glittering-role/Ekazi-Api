import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import BlockedDate from "../../models/blocked_date";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { isPastDate, isValidDate } from "../../utils/bookingValidation";


// Create blocked date
const createBlockedDate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req) ?? "";
        const { blocked_date, reason } = req.body;

        // Validate input
        if (!blocked_date) {
            res.status(400).json(createResponse(false, 'Blocked date is required'));
            return;
        }

        if (!isValidDate(blocked_date)) {
            res.status(400).json(createResponse(false, 'Invalid date format (use YYYY-MM-DD)'));
            return;
        }

        if (isPastDate(blocked_date)) {
            res.status(400).json(createResponse(false, 'Cannot block dates in the past'));
            return;
        }

        // Check for existing block
        const existing = await BlockedDate.findOne({
            where: { provider_id, blocked_date }
        });

        if (existing) {
            res.status(409).json(createResponse(false, 'This date is already blocked'));
            return;
        }

        const blocked = await BlockedDate.create({
            provider_id,
            blocked_date,
            reason
        });

        res.status(201).json(createResponse(true, 'Date blocked successfully', {blocked}));
    } catch (error) {
        handleError(error, req, res, "Error blocking date");
    }
});

// Get all blocked dates for provider
const getBlockedDates = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        
        const blockedDates = await BlockedDate.findAll({
            where: { provider_id },
            attributes: ['id', 'blocked_date', 'reason', 'createdAt', 'updatedAt'],
            order: [['blocked_date', 'ASC']]
        });

        res.status(200).json(createResponse(true, 'Blocked dates retrieved', { blockedDates }));
    } catch (error) {
        handleError(error, req, res, "Error fetching blocked dates");
    }
});

// Update blocked date
const updateBlockedDate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        const { id } = req.params;
        const { blocked_date, reason } = req.body;

        const blocked = await BlockedDate.findOne({
            where: { id, provider_id }
        });

        if (!blocked) {
            res.status(404).json(createResponse(false, 'Blocked date not found'));
            return;
        }

        if (blocked_date) {
            if (!isValidDate(blocked_date)) {
                res.status(400).json(createResponse(false, 'Invalid date format'));
                return;
            }

            if (isPastDate(blocked_date)) {
                res.status(400).json(createResponse(false, 'Cannot reschedule to past date'));
                return;
            }

            blocked.blocked_date = blocked_date;
        }

        if (reason) blocked.reason = reason;
        
        await blocked.save();
        res.status(200).json(createResponse(true, 'Blocked date updated', {blocked}));
    } catch (error) {
        handleError(error, req, res, "Error updating blocked date");
    }
});

// Delete blocked date
const deleteBlockedDate = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        const { id } = req.params;

        const blocked = await BlockedDate.findOne({
            where: { id, provider_id }
        });

        if (!blocked) {
            res.status(404).json(createResponse(false, 'Blocked date not found'));
            return;
        }

        await blocked.destroy();
        res.status(200).json(createResponse(true, 'Blocked date removed'));
    } catch (error) {
        handleError(error, req, res, "Error deleting blocked date");
    }
});

export {
    createBlockedDate,
    getBlockedDates,
    updateBlockedDate,
    deleteBlockedDate
};