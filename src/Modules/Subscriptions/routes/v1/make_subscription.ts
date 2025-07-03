import express from 'express';
import {createSubscription} from "../../controllers/payments/make_subscription";
import {verifyToken} from "../../../Users/middleware/jwt_auth";

const MakeSubscriptionRouters = express.Router();

MakeSubscriptionRouters.use(verifyToken)

/**
 * @swagger
 * tags:
 *   - name: Subscription Checkout
 *     description: Operations related to subscriptions and payments.
 */

/**
 * @swagger
 * /checkout/make-subscription:
 *   post:
 *     summary: Create a new subscription and initiate payment.
 *     tags:
 *       - Subscription Checkout
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plan_id:
 *                 type: string
 *                 description: The ID of the subscription plan.
 *               auto_renew:
 *                 type: boolean
 *                 description: Indicates if the subscription should auto-renew.
 *               phone:
 *                 type: string
 *                 description: The phone number to which the STK push will be sent.
 *             required:
 *               - plan_id
 *               - phone
 *               - amount
 *     responses:
 *       201:
 *         description: Subscription created and payment initiated successfully.
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Subscription plan not found or inactive.
 *       500:
 *         description: Internal server error.
 */
MakeSubscriptionRouters.post('/make-subscription', createSubscription);


export default MakeSubscriptionRouters;