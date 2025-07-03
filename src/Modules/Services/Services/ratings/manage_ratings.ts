import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import Ratings from "../../models/rating";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";

const editRating = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { ratingId } = req.params;
        const { rating, comment } = req.body;
        const user_id = getUserIdFromToken(req);

        // Validate required fields
        if (!ratingId || !rating) {
            res.status(400).json(createResponse(false, "ratingId and rating are required"));
            return;
        }

        // Validate rating value (must be between 1 and 5)
        if (rating < 1 || rating > 5) {
            res.status(400).json(createResponse(false, "Rating must be between 1 and 5"));
            return;
        }

        // Find the rating to edit
        const existingRating = await Ratings.findByPk(ratingId);

        if (!existingRating) {
            res.status(404).json(createResponse(false, "Rating not found"));
            return;
        }

       
        // Update the rating
        existingRating.rating = rating;
        existingRating.comment = comment || existingRating.comment;
        await existingRating.save();

        // Return the updated rating
        res.status(200).json(createResponse(true, "Rating updated successfully", { rating: existingRating }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while editing the rating");
    }
});


const deleteRating = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { ratingId } = req.params;
        const user_id = getUserIdFromToken(req);

        // Validate required fields
        if (!ratingId) {
            res.status(400).json(createResponse(false, "ratingId is required"));
            return;
        }

        // Find the rating to delete
        const existingRating = await Ratings.findByPk(ratingId);

        if (!existingRating) {
            res.status(404).json(createResponse(false, "Rating not found"));
            return;
        }

        // Delete the rating
        await existingRating.destroy();

        // Return success response
        res.status(200).json(createResponse(true, "Rating deleted successfully"));
    } catch (error) {
        handleError(error, req, res, "An error occurred while deleting the rating");
    }
});


export { editRating , deleteRating };