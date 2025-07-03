import express from 'express';
import {
    deleteSubscription,
    getAllSubscriptions, getSubscriptionById,
    getSubscriptionOfTheAuthUserById,
    updateSubscription
} from "../../controllers/subscriptions/subscriptions";
import { verifyToken } from "../../../Users/middleware/jwt_auth";

const subscriptionRoutes = express.Router();

// Use authentication middleware
subscriptionRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Manage user subscriptions
 */


/**
 * @swagger
 * /subscriptions/get-all-subscriptions:
 *   get:
 *     summary: Get all subscriptions with pagination
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all subscriptions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       user_id:
 *                         type: string
 *                         example: "1"
 *                       plan_id:
 *                         type: string
 *                         example: "1"
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-09-07T12:00:00Z"
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-07T12:00:00Z"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       auto_renew:
 *                         type: boolean
 *                         example: true
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pageCount:
 *                       type: integer
 *                       example: 5
 *                     itemCount:
 *                       type: integer
 *                       example: 50
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *                     pages:
 *                       type: array
 *                       items:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Internal server error.
 */
subscriptionRoutes.get('/get-all-subscriptions', getAllSubscriptions);

/**
 * @swagger
 * /subscriptions/get-subscription-byId/{id}:
 *   get:
 *     summary: Get a subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 user_id:
 *                   type: string
 *                   example: "1"
 *                 plan_id:
 *                   type: string
 *                   example: "1"
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-07T12:00:00Z"
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-07T12:00:00Z"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 auto_renew:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionRoutes.get('/get-subscription-byId/:id', getSubscriptionById);

/**
 * @swagger
 * /subscriptions/update-subscription/{id}:
 *   put:
 *     summary: Update a subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "1"
 *               plan_id:
 *                 type: string
 *                 example: "1"
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-09-07T12:00:00Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-09-07T12:00:00Z"
 *               status:
 *                 type: string
 *                 example: "active"
 *               auto_renew:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Subscription updated successfully.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionRoutes.put('/update-subscription/:id', updateSubscription);

/**
 * @swagger
 * /subscriptions/delete/{id}:
 *   delete:
 *     summary: Delete a subscription by ID
 *     tags: [Subscriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription deleted successfully.
 *       404:
 *         description: Subscription not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionRoutes.delete('/delete-subscription/:id', deleteSubscription);

/**
 * @swagger
 * /subscriptions/my-subscription:
 *   get:
 *     summary: Get subscription of the authenticated user
 *     tags: [Subscriptions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription details for the authenticated user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 user_id:
 *                   type: string
 *                   example: "1"
 *                 plan_id:
 *                   type: string
 *                   example: "1"
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-09-07T12:00:00Z"
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-09-07T12:00:00Z"
 *                 status:
 *                   type: string
 *                   example: "active"
 *                 auto_renew:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Subscription not found or does not belong to the authenticated user.
 *       500:
 *         description: Internal server error.
 */
subscriptionRoutes.get('/my-subscription', getSubscriptionOfTheAuthUserById);

export default subscriptionRoutes;