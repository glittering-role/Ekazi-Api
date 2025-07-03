import express from 'express';
import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import {
    acceptServiceOrder,
    completeServiceOrder,
    createServiceOrder,
    declineServiceOrder,
} from "../../../ServiceOrder/service_request";
import { getOrders } from "../../../ServiceOrder/service_orders_management";
import {attachUserRoles} from "../../../../Users/middleware/attachUserRoles";

const serviceOrderRouter = express.Router();

// Middleware to verify token (authentication check)
serviceOrderRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Service Orders
 *   description: Service Orders management
 */



/**
 * @swagger
 * /service-orders:
 *   get:
 *     summary: Get all orders placed by the client
 *     tags: [Service Orders]
 *     parameters:
 *       - in: query
 *         name: trackingNumber
 *         schema:
 *           type: string
 *         description: Filter by tracking number
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by order date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: Successfully retrieved client orders
 *       401:
 *         description: Unauthorized. User not authenticated
 */
serviceOrderRouter.get('/', attachUserRoles, getOrders);


/**
 * @swagger
 * /service-orders:
 *   post:
 *     summary: Create a new service order
 *     tags: [Service Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: string
 *                 example: "5f7e8b9c9e0a8b001f2d9c8d"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -1.286389
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 36.817223
 *     responses:
 *       201:
 *         description: Service order created successfully
 *       400:
 *         description: Bad request. Validation failed
 *       401:
 *         description: Unauthorized. User not authenticated
 */
serviceOrderRouter.post('/', createServiceOrder);


/**
 * @swagger
 * /service-orders/{order_id}/accept:
 *   patch:
 *     summary: Accept a service order
 *     tags: [Service Orders]
 *     parameters:
 *       - name: order_id
 *         in: path
 *         description: The ID of the service order to accept
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service order accepted successfully and payment initiated
 *       400:
 *         description: Bad request. Validation failed or service order is not in a pending state
 *       401:
 *         description: Unauthorized. Provider not authenticated
 *       404:
 *         description: Service order not found
 */
serviceOrderRouter.patch('/:order_id/accept', acceptServiceOrder);


/**
 * @swagger
 * /service-orders/{order_id}/complete:
 *   patch:
 *     summary: Complete a service order
 *     tags: [Service Orders]
 *     parameters:
 *       - name: order_id
 *         in: path
 *         description: The ID of the service order to complete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service order completed successfully and payment released to provider
 *       400:
 *         description: Bad request. Service order is not in progress
 *       401:
 *         description: Unauthorized. User not authenticated
 *       404:
 *         description: Service order not found
 */
serviceOrderRouter.patch('/:order_id/complete', completeServiceOrder);

/**
 * @swagger
 * /service-orders/{order_id}/decline:
 *   patch:
 *     summary: Decline a service order
 *     tags: [Service Orders]
 *     parameters:
 *       - name: order_id
 *         in: path
 *         description: The ID of the service order to decline
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service order declined successfully
 *       400:
 *         description: Bad request. Service order cannot be declined in its current state
 *       401:
 *         description: Unauthorized. Provider not authenticated
 *       404:
 *         description: Service order not found
 */
serviceOrderRouter.patch('/:order_id/decline', declineServiceOrder);

export default serviceOrderRouter;
