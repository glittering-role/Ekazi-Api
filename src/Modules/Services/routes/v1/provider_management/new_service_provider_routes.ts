import express from 'express';
import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import upload from "../../../../../utils/multer/image_upload";
import {
    createOrUpdateServiceProvider,
    verifyUserApproval,
    suspendOrFlagServiceProvider,  // Import the new function
} from "../../../Services/provider_management/new_service_provider";

const newServiceProviderRouter = express.Router();

// Middleware to verify token (authentication check)
newServiceProviderRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: New Service Provider
 *   description: Service Provider management
 */

/**
 * @swagger
 * /new_service-provider/create-or-update:
 *   post:
 *     summary: Create or update service provider details
 *     tags: [New Service Provider]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               business_name:
 *                 type: string
 *                 example: "dev"
 *               business_type:
 *                 type: string
 *                 example: "solo"
 *               phone_number:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Service provider details created or updated successfully.
 *       400:
 *         description: Bad request. Validation failed.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
newServiceProviderRouter.post('/create-or-update', upload, createOrUpdateServiceProvider);

/**
 * @swagger
 * /new_service-provider/verify-user-approval:
 *   patch:
 *     summary: Verify a service provider's details and approve them
 *     tags: [New Service Provider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "user1234"
 *     responses:
 *       200:
 *         description: User approved and verified successfully.
 *       400:
 *         description: Bad request. User already verified.
 *       404:
 *         description: User or verification document not found.
 *       500:
 *         description: Internal server error.
 */
newServiceProviderRouter.patch('/verify-user-approval', verifyUserApproval);

/**
 * @swagger
 * /new_service-provider/suspend-or-flag:
 *   patch:
 *     summary: Suspend or flag a service provider account
 *     tags: [New Service Provider]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "user1234"
 *               status:
 *                 type: string
 *                 example: "suspended"
 *     responses:
 *       200:
 *         description: Service provider status updated successfully.
 *       400:
 *         description: Bad request. User ID or status is missing.
 *       404:
 *         description: Service provider not found.
 *       500:
 *         description: Internal server error.
 */
newServiceProviderRouter.patch('/suspend-or-flag', suspendOrFlagServiceProvider);



export default newServiceProviderRouter;
