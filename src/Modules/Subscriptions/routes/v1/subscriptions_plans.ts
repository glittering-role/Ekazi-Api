import express from 'express';
import {verifyToken} from "../../../Users/middleware/jwt_auth";
import { createSubscriptionPlan } from '../../controllers/subscriptionsPlans/create_plans';
import {
    getAllSubscriptionPlans,
    updateSubscriptionPlan,
    getSubscriptionPlanById,
    deleteSubscriptionPlan, toggleSubscriptionPlanStatus
} from "../../controllers/subscriptionsPlans/manage_plans";

const subscriptionPlansRoutes = express.Router();

subscriptionPlansRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Subscription Plans
 *   description: Manage subscription plans
 */

/**
 * @swagger
 * /plans/create:
 *   post:
 *     summary: Create a new subscription plan
 *     tags: [Subscription Plans]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Premium Plan
 *               description:
 *                 type: string
 *                 example: A premium subscription plan offering priority support.
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 49.99
 *               billing_cycle:
 *                 type: string
 *                 example: monthly
 *               service_limit:
 *                 type: integer
 *                 example: 10
 *               trial_period:
 *                 type: integer
 *                 example: 14
 *               discount:
 *                 type: number
 *                 format: float
 *                 example: 10.00
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: Priority support
 *     responses:
 *       201:
 *         description: Subscription plan created successfully.
 *       400:
 *         description: Validation errors.
 *       500:
 *         description: Internal server error.
 */
subscriptionPlansRoutes.post('/create', createSubscriptionPlan);

/**
 * @swagger
 * /plans/get-all:
 *   get:
 *     summary: Get all subscription plans
 *     tags: [Subscription Plans]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all subscription plans.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Premium Plan
 *                   description:
 *                     type: string
 *                     example: A premium subscription plan offering priority support.
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 49.99
 *                   billing_cycle:
 *                     type: string
 *                     example: monthly
 *                   service_limit:
 *                     type: integer
 *                     example: 10
 *                   trial_period:
 *                     type: integer
 *                     example: 14
 *                   discount:
 *                     type: number
 *                     format: float
 *                     example: 10.00
 *                   is_active:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Internal server error.
 */
subscriptionPlansRoutes.get('/get-all', getAllSubscriptionPlans);

/**
 * @swagger
 * /plans/get-by-id/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription plan
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription plan details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Premium Plan
 *                 description:
 *                   type: string
 *                   example: A premium subscription plan offering priority support.
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 49.99
 *                 billing_cycle:
 *                   type: string
 *                   example: monthly
 *                 is_active:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Subscription plan not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionPlansRoutes.get('/get-by-id/:id', getSubscriptionPlanById);

/**
 * @swagger
 * /plans/update/{id}:
 *   put:
 *     summary: Update a subscription plan by ID
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription plan
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Plan Name
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 59.99
 *               description:
 *                 type: string
 *                 example: Updated description of the plan.
 *     responses:
 *       200:
 *         description: Subscription plan updated successfully.
 *       404:
 *         description: Subscription plan not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionPlansRoutes.put('/update/:id', updateSubscriptionPlan);

/**
 * @swagger
 * /plans/{id}/toggle-status:
 *   patch:
 *     summary: Toggle the activation status of a plan
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The Plan ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plan activation status updated.
 *       404:
 *         description: Plan not found.
 */
subscriptionPlansRoutes.patch('/:id/toggle-status', toggleSubscriptionPlanStatus);

/**
 * @swagger
 * /plans/delete/{id}:
 *   delete:
 *     summary: Delete a subscription plan by ID
 *     tags: [Subscription Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the subscription plan
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription plan deleted successfully.
 *       404:
 *         description: Subscription plan not found.
 *       500:
 *         description: Internal server error.
 */
subscriptionPlansRoutes.delete('/delete/:id', deleteSubscriptionPlan);

export default subscriptionPlansRoutes;