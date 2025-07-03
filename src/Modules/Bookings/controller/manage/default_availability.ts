import { Request, Response } from "express";
import { createResponse } from "../../../../logs/helpers/response";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import DefaultAvailability from "../../models/default_availability";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { Op } from "sequelize";
import { isStartBeforeEnd, isValidTime, isValidDate, isPastDate } from "../../utils/bookingValidation";
import cron from "node-cron";

const TWO_MONTHS_IN_FUTURE = new Date();
TWO_MONTHS_IN_FUTURE.setMonth(TWO_MONTHS_IN_FUTURE.getMonth() + 2);

// Helper function to calculate ISO week number
const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
};

// Helper function to ensure no more than 4 dates in any ISO week
const isValidWeeklySelection = (selectedDates: string[]): boolean => {
    const weeks: Record<string, number> = {};
    for (const dateStr of selectedDates) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        const key = `${year}-W${week}`;
        weeks[key] = (weeks[key] || 0) + 1;
    }
    return Object.values(weeks).every(count => count <= 4);
};

const createDefaultAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req) ?? "";
        const { selected_dates, start_time, end_time } = req.body;

        if (!selected_dates || !Array.isArray(selected_dates) || selected_dates.length === 0 || !start_time || !end_time) {
            res.status(400).json(createResponse(false, 'Invalid input: selected_dates must be an array with at least one date'));
            return;
        }

        if (!selected_dates.every(isValidDate)) {
            res.status(400).json(createResponse(false, 'Invalid date format (use YYYY-MM-DD)'));
            return;
        }

        if (selected_dates.some(isPastDate)) {
            res.status(400).json(createResponse(false, 'Selected dates cannot be in the past'));
            return;
        }

        if (!isValidTime(start_time) || !isValidTime(end_time)) {
            res.status(400).json(createResponse(false, 'Invalid time format (use HH:MM:SS)'));
            return;
        }

        if (!isStartBeforeEnd(start_time, end_time)) {
            res.status(400).json(createResponse(false, 'Start time must be before end time'));
            return;
        }

        if (!isValidWeeklySelection(selected_dates)) {
            res.status(400).json(createResponse(false, 'You can only select up to 4 days in a week'));
            return;
        }

        if (selected_dates.some(date => new Date(date) > TWO_MONTHS_IN_FUTURE)) {
            res.status(400).json(createResponse(false, 'Availability cannot exceed 2 months in the future'));
            return;
        }

        // Check for existing dates in any entries for this provider
        const existingAvailabilities = await DefaultAvailability.findAll({
            where: {
                provider_id,
                selected_dates: { [Op.overlap]: selected_dates }
            }
        });

        if (existingAvailabilities.length > 0) {
            const existingDates = existingAvailabilities.flatMap(avail => avail.selected_dates);
            const duplicateDates = selected_dates.filter(date => existingDates.includes(date));

            if (duplicateDates.length > 0) {
                res.status(400).json(createResponse(false, `Duplicate availability: You already have an availability entry for the following dates: ${duplicateDates.join(', ')}`));
                return;
            }
        }

        // Create new availability
        const availability = await DefaultAvailability.create({ provider_id, selected_dates, start_time, end_time });

        res.status(201).json(createResponse(true, 'Availability created', { availability }));
    } catch (error) {
        handleError(error, req, res, `Error creating availability ${error}`);
    }
});

const getProviderAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        const availabilities = await DefaultAvailability.findAll({
            where: { provider_id },
            attributes: ['id', 'selected_dates', 'start_time', 'end_time', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(createResponse(true, 'Availability retrieved', { availabilities }));
    } catch (error) {
        handleError(error, req, res, "Error fetching availability");
    }
});

const updateDefaultAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        const { id } = req.params;
        const { selected_dates, start_time, end_time } = req.body;

        if (!selected_dates || !Array.isArray(selected_dates) || selected_dates.length === 0 || !start_time || !end_time) {
            res.status(400).json(createResponse(false, 'Invalid input: selected_dates must be an array with at least one date'));
            return;
        }

        if (!selected_dates.every(isValidDate)) {
            res.status(400).json(createResponse(false, 'Invalid date format (use YYYY-MM-DD)'));
            return;
        }

        if (selected_dates.some(isPastDate)) {
            res.status(400).json(createResponse(false, 'Selected dates cannot be in the past'));
            return;
        }

        if (!isValidTime(start_time) || !isValidTime(end_time)) {
            res.status(400).json(createResponse(false, 'Invalid time format (use HH:MM:SS)'));
            return;
        }

        if (!isStartBeforeEnd(start_time, end_time)) {
            res.status(400).json(createResponse(false, 'Start time must be before end time'));
            return;
        }

        if (!isValidWeeklySelection(selected_dates)) {
            res.status(400).json(createResponse(false, 'You can only select up to 4 days in a week'));
            return;
        }

        if (selected_dates.some(date => new Date(date) > TWO_MONTHS_IN_FUTURE)) {
            res.status(400).json(createResponse(false, 'Availability cannot exceed 2 months in the future'));
            return;
        }

        const availability = await DefaultAvailability.findOne({ where: { id, provider_id } });
        if (!availability) {
            res.status(404).json(createResponse(false, 'Availability not found'));
            return;
        }

        // Check for duplicate dates in other entries (excluding current entry)
        const existingAvailabilities = await DefaultAvailability.findAll({
            where: {
                provider_id,
                id: { [Op.ne]: id }, // Exclude current entry
                selected_dates: { [Op.overlap]: selected_dates }
            }
        });

        if (existingAvailabilities.length > 0) {
            const existingDates = existingAvailabilities.flatMap(avail => avail.selected_dates);
            const duplicateDates = selected_dates.filter(date => existingDates.includes(date));

            if (duplicateDates.length > 0) {
                res.status(400).json(createResponse(false, `Duplicate availability: You already have an availability entry for the following dates: ${duplicateDates.join(', ')}`));
                return;
            }
        }

        availability.selected_dates = selected_dates;
        availability.start_time = start_time;
        availability.end_time = end_time;
        await availability.save();

        res.status(200).json(createResponse(true, 'Availability updated', { availability }));
    } catch (error) {
        handleError(error, req, res, "Error updating availability");
    }
});

const deleteDefaultAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const provider_id = getUserIdFromToken(req);
        const { id } = req.params;
        const { date } = req.body;

        const availability = await DefaultAvailability.findOne({ where: { id, provider_id } });
        if (!availability) {
            res.status(404).json(createResponse(false, 'Availability not found'));
            return;
        }

        if (date) {
            // Remove the specific date from the array
            availability.selected_dates = availability.selected_dates.filter(d => d !== date);
            if (availability.selected_dates.length === 0) {
                await availability.destroy();
            } else {
                await availability.save();
            }
        } else {
            // Delete the entire record
            await availability.destroy();
        }

        res.status(200).json(createResponse(true, 'Availability deleted'));
    } catch (error) {
        handleError(error, req, res, "Error deleting availability");
    }
});




export {
    createDefaultAvailability,
    getProviderAvailability,
    updateDefaultAvailability,
    deleteDefaultAvailability
};
