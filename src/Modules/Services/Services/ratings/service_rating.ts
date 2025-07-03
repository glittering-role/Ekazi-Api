import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { Ratings, Service, ServiceProviders } from "../../models/associations";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import rating from "../../models/rating";

const rateServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { service_id, rating, comment } = req.body;
        const user_id = getUserIdFromToken(req) ?? "";

        // Validate required fields
        if (!service_id || !rating) {
            res.status(400).json(createResponse(false, "service_id and rating are required"));
            return;
        }

        // Validate rating value (must be between 1 and 5)
        if (rating < 1 || rating > 5) {
            res.status(400).json(createResponse(false, "Rating must be between 1 and 5"));
            return;
        }

        // Check if the user has already rated this service
        const existingRating = await Ratings.findOne({
            where: { service_id, user_id },
        });

        if (existingRating) {
            res.status(400).json(createResponse(false, "You have already rated this service"));
            return;
        }

        // Create a new rating
        const newRating = await Ratings.create({
            service_id,
            user_id: user_id,
            rating,
            comment: comment || null
        });

        // Return the created rating
        res.status(201).json(createResponse(true, "Service rated successfully"));
    } catch (error) {
        handleError(error, req, res, "An error occurred while rating the service");
    }
});

export { rateServiceProvider };
