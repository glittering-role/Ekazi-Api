import express from 'express';
import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import {rateServiceProvider} from "../../../Services/ratings/service_rating";
import {deleteRating, editRating} from "../../../Services/ratings/manage_ratings";

const ServiceProvidersRatingRoutes = express.Router();

ServiceProvidersRatingRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Service Rating
 *   description: Manage service provider ratings
 */

/**
 * @swagger
 * /services-rating/rate:
 *   post:
 *     summary: Rate a service provider
 *     tags: [Service Rating]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: string
 *                 description: The ID of the service being rated
 *               rating:
 *                 type: integer
 *                 description: The rating value (1 to 5)
 *               comment:
 *                 type: string
 *                 description: Optional comment for the rating
 *             required:
 *               - service_id
 *               - user_id
 *               - rating
 *     responses:
 *       201:
 *         description: Service provider rated successfully
 *       400:
 *         description: Invalid input or user has already rated this service
 *       500:
 *         description: Internal server error
 */
ServiceProvidersRatingRoutes.post('/rate', rateServiceProvider);

/**
 * @swagger
 * /services-rating/ratings/{ratingId}:
 *   put:
 *     summary: Edit a rating
 *     tags: [Service Rating]
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rating to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 description: The updated rating value (1 to 5)
 *               comment:
 *                 type: string
 *                 description: Optional updated comment for the rating
 *             required:
 *               - rating
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized to edit this rating
 *       404:
 *         description: Rating not found
 *       500:
 *         description: Internal server error
 */
ServiceProvidersRatingRoutes.put('/ratings/:ratingId', editRating);

/**
 * @swagger
 * /services-rating/ratings/{ratingId}:
 *   delete:
 *     summary: Delete a rating
 *     tags: [Service Rating]
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the rating to delete
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       403:
 *         description: Unauthorized to delete this rating
 *       404:
 *         description: Rating not found
 *       500:
 *         description: Internal server error
 */
ServiceProvidersRatingRoutes.delete('/ratings/:ratingId', deleteRating);

export { ServiceProvidersRatingRoutes };