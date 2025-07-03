import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import {ServiceProviders} from "../../models/associations";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import {io} from "../../../../config/ws";

// Toggle "is_online" status
const toggleOnlineStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        const serviceProvider = await ServiceProviders.findOne({where:{user_id:user_id}});

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        // Toggle the "is_online" status
        serviceProvider.is_online = !serviceProvider.is_online;
        await serviceProvider.save();

        // Emit socket event based on online status
        if (serviceProvider.is_online) {
            io.emit('user-online', user_id);
        } else {
            io.emit('user-offline', user_id);
        }

        const message = serviceProvider.is_online
            ? "Service provider is now online"
            : "Service provider is now offline";

        res.status(200).json(createResponse(true, message, { serviceProvider }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while toggling the online status");
    }
});


// Toggle "is_occupied" status
const toggleOccupiedStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);
        const serviceProvider = await ServiceProviders.findOne({where:{user_id:user_id}});

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        // Toggle the "is_occupied" status
        serviceProvider.is_occupied = !serviceProvider.is_occupied;
        await serviceProvider.save();

        const message = serviceProvider.is_occupied
            ? "Service provider is now occupied"
            : "Service provider is now available";

        res.status(200).json(createResponse(true, message, { serviceProvider }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while toggling the occupied status");
    }
});

export { toggleOnlineStatus, toggleOccupiedStatus };
