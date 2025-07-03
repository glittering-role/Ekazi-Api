import express from 'express';
import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import { getServiceProvidersBySubcategory } from "../../../Services/filter/filter_service";
import {getServiceProviderProfile} from "../../../Services/filter/filter_profile";

const ServiceProvidersSearchRoutes = express.Router();

// Middleware to verify token (authentication check)
ServiceProvidersSearchRoutes.use(verifyToken);

/**
 * @swagger
 * /services-filter/by-subcategory/{subcategoryId}:
 *   get:
 *     summary: Get service providers filtered by subcategory
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subcategory
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Search by location
 *     responses:
 *       200:
 *         description: Service providers retrieved successfully
 *       404:
 *         description: No matching service providers found
 *       500:
 *         description: Internal server error
 */
ServiceProvidersSearchRoutes.get('/by-subcategory/:subcategoryId', getServiceProvidersBySubcategory);

/**
 * @swagger
 * /services-filter/by-subcategory/profile/{serviceId}:
 *   get:
 *     summary: Get the profile of a single service provider
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the service provider
 *     responses:
 *       200:
 *         description: Service provider profile retrieved successfully
 *       404:
 *         description: Service provider not found
 *       500:
 *         description: Internal server error
 */
ServiceProvidersSearchRoutes.get('/by-subcategory/profile/:serviceId', getServiceProviderProfile);


export { ServiceProvidersSearchRoutes };
