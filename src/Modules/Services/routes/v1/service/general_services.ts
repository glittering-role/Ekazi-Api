import express from 'express';

import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import {getAllServices} from "../../../Services/service/services";

const GeneralSevicesRoutes = express.Router();

// Middleware to verify token (authentication check)
GeneralSevicesRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Services management
 */


/**
 * @swagger
 * /services/get-all-services:
 *   get:
 *     summary: Get a single service by ID
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
GeneralSevicesRoutes.get('/get-all-services', getAllServices);



export { GeneralSevicesRoutes };
