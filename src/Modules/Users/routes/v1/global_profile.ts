import express from 'express';
import { verifyToken } from '../../middleware/jwt_auth';
import { globalProfile } from "../../controller/global_profile";

const GlobalProfileRouter = express.Router();

// Apply the verifyToken middleware to all routes in this router
GlobalProfileRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Global Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /global_profile/{user_id}:
 *   get:
 *     summary: Retrieve the profile of the user
 *     tags: [Global Profile]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose profile is to be retrieved
 *     responses:
 *       200:
 *         description: User profile details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       404:
 *         description: User not found.
 */
GlobalProfileRouter.get('/:user_id', globalProfile);

export default GlobalProfileRouter;