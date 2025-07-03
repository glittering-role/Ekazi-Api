import express from 'express';
import {
    getAllServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    toggleServiceProviderStatus,
    softDeleteServiceProvider, getServiceProviderById,
} from '../../../Services/provider_management/manage_service_provider_account';
import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import {toggleOccupiedStatus, toggleOnlineStatus} from "../../../Services/provider_management/toggle_status";
import {suspendOrFlagServiceProvider} from "../../../Services/provider_management/new_service_provider";
import newServiceProviderRouter from "./new_service_provider_routes";

const serviceProvidersRouter = express.Router();

// Middleware to verify token (authentication check)
serviceProvidersRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Service Providers
 *   description: Service Providers management
 */

/**
 * @swagger
 * /service-providers:
 *   get:
 *     summary: Get all service providers
 *     tags: [Service Providers]
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search term for service providers
 *         required: false
 *         schema:
 *           type: string
 *       - name: is_online
 *         in: query
 *         description: Filter by online status
 *         required: false
 *         schema:
 *           type: boolean
 *       - name: is_occupied
 *         in: query
 *         description: Filter by occupied status
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successfully retrieved service providers
 *       400:
 *         description: Bad request. Validation failed.
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.get('/', getAllServiceProviders);


/**
 * @swagger
 * /service-providers/my-profile:
 *   get:
 *     summary: Retrieve service provider details by ID
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Service provider retrieved successfully.
 *       404:
 *         description: Service provider not found.
 *       500:
 *         description: Internal server error.
 */
serviceProvidersRouter.get('/my-profile', getServiceProviderById);


/**
 * @swagger
 * /service-providers:
 *   put:
 *     summary: Update a service provider
 *     tags: [Service Providers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_location:
 *                 type: string
 *               work_description:
 *                 type: string
 *               availability:
 *                 type: boolean
 *               phone_number:
 *                 type: string
 *               business_type:
 *                 type: string
 *               experience_level_id:
 *                 type: integer
 *               location_preference_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated the service provider
 *       400:
 *         description: Bad request. Validation failed.
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.put('/', updateServiceProvider);

/**
 * @swagger
 * /service-providers:
 *   delete:
 *     summary: Delete a service provider
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Successfully deleted the service provider
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.delete('/', deleteServiceProvider);

/**
 * @swagger
 * /service-providers/status:
 *   patch:
 *     summary: Toggle service provider verification status
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Successfully toggled the service provider verification status
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.patch('/status', toggleServiceProviderStatus);

/**
 * @swagger
 * /service-providers/soft-delete:
 *   patch:
 *     summary: Soft delete (deactivate) a service provider
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Successfully updated the service provider status
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.patch('/soft-delete', softDeleteServiceProvider);

/**
 * @swagger
 * /service-providers/online-status:
 *   patch:
 *     summary: Toggle the "is_online" status of a service provider
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Successfully toggled the online status of the service provider
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.patch('/online-status', toggleOnlineStatus);

/**
 * @swagger
 * /service-providers/occupied-status:
 *   patch:
 *     summary: Toggle the "is_occupied" status of a service provider
 *     tags: [Service Providers]
 *     responses:
 *       200:
 *         description: Successfully toggled the occupied status of the service provider
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized.
 */
serviceProvidersRouter.patch('/occupied-status', toggleOccupiedStatus);

export { serviceProvidersRouter };
