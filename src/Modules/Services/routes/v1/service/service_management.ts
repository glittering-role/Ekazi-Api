import express from 'express';

import { verifyToken } from "../../../../Users/middleware/jwt_auth";
import {createService} from "../../../Services/service/create_service";
import {
    getMyService,
    updateService,
    deleteService,
    toggleServiceStatus,
    updateImageById,
    deleteImageById,
     addServiceImage,
     getServiceById
} from "../../../Services/service/service_management";
import upload from "../../../../../utils/multer/image_upload";

const serviceRouter = express.Router();

// Middleware to verify token (authentication check)
serviceRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Services management
 */


/**
 * @swagger
 * /services/create-service:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Plumbing Service"
 *               description:
 *                 type: string
 *                 example: "Expert plumbing services for home repairs and installations."
 *               sub_category_id:
 *                 type: string
 *                 example: "5f7e8b9c9e0a8b001f2d9c8d"
 *               pricing_mode:
 *                 type: string
 *                 example: "fixed"  # could be "hourly" or "fixed" based on your use case
 *               price_from:
 *                 type: number
 *                 format: float
 *                 example: 50.00  # The price in USD or any applicable currency
 *               price_to:
 *                   type: number
 *                   format: float
 *                   example: 100.00  # The price in USD or any applicable currency
 *               location:
 *                 type: string
 *                 example: "123 Main Street, City, Country"
 *               service_location_preference:
 *                 type: string
 *                 example: "on-site"
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -1.286389
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: 36.817223
 *               image_url:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 example:
 *                   - "service_image1.jpg"
 *                   - "service_image2.png"
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Bad request. Validation failed
 */

serviceRouter.post('/create-service', upload, createService);


/**
 * @swagger
 * /services/get-my-services:
 *   get:
 *     summary: Get a services of  an auth user
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
serviceRouter.get('/get-my-services', getMyService);

/**
 * @swagger
 * /services/get-service/{id}:
 *   get:
 *     summary: Get a service by ID
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the service to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Service retrieved successfully"
 *               data:
 *                 id: "12345"
 *                 title: "Plumbing Service"
 *                 description: "Expert plumbing services for home repairs"
 *                 price: 50.0
 *                 location: "Nairobi, Kenya"
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Service not found"
 */
serviceRouter.get('/get-service/:id', getServiceById);

/**
 * @swagger
 * /services/update-service/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the service to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Plumbing Service"
 *               description:
 *                 type: string
 *                 example: "Fixing leaks and installing pipes"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 50.0
 *               location:
 *                 type: string
 *                 example: "Nairobi, Kenya"
 *               postFor:
 *                 type: string
 *                 example: "home repair"
 *               pricing_mode:  # ✅ Keep only one occurrence
 *                 type: string
 *                 example: "fixed"
 *               sub_category_id:
 *                 type: string
 *                 example: "12345"
 *               service_location_preference:
 *                 type: string
 *                 example: "remote"
 *     responses:
 *       200:
 *         description: Successfully updated the service
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Service updated successfully"
 *               data:
 *                 id: "12345"
 *                 title: "Plumbing Service"
 *                 description: "Fixing leaks and installing pipes"
 *                 price: 50.0
 *                 location: "Nairobi, Kenya"
 *                 postFor: "home repair"
 *       400:
 *         description: Bad request. Validation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Validation failed"
 *               errors:
 *                 title: "Title is required"
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Service not found"
 */
serviceRouter.put('/update-service/:id', updateService);

/**
 * @swagger
 * /services/delete-service/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the service to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the service
 *       404:
 *         description: Service not found
 */
serviceRouter.delete('/delete-service/:id', deleteService);

/**
 * @swagger
 * /services/toggle-service-status/{id}/status:
 *   patch:
 *     summary: Toggle the service's status
 *     tags: [Services]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: The ID of the service to toggle the status
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully toggled the service status
 *       404:
 *         description: Service not found
 */
serviceRouter.patch('/toggle-service-status/:id/status', toggleServiceStatus);

/**
 * @swagger
 * /services/images/add-image/{serviceId}:
 *   post:
 *     summary: Add an image to a service
 *     tags: [Services]
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         description: The ID of the service to which the image will be added
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image added successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Image added successfully"
 *               data:
 *                 newImage:
 *                   service_id: "12345"
 *                   image_url: "https://example.com/image.jpg"
 *                   is_primary: true
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             examples:
 *               NoImage:
 *                 summary: No image file provided
 *                 value:
 *                   success: false
 *                   message: "No image file provided"
 *               MaxImagesReached:
 *                 summary: Maximum images reached
 *                 value:
 *                   success: false
 *                   message: "You can only upload up to 7 images for a service"
 *       404:
 *         description: Service not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Service not found"
 */
serviceRouter.post('/images/add-image/:serviceId', upload, addServiceImage);

/**
 * @swagger
 * /services/images/updateImage/{imageId}:
 *   patch:
 *     summary: Update an image of a service
 *     tags: [Services]
 *     parameters:
 *       - name: imageId
 *         in: path
 *         description: The ID of the image to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully updated the image
 *       404:
 *         description: Image not found
 */
serviceRouter.patch('/images/updateImage/:imageId', upload, updateImageById);

/**
 * @swagger
 * /services/images/delete-image/{imageId}:
 *   delete:
 *     summary: Delete an image of a service
 *     tags: [Services]
 *     parameters:
 *       - name: imageId
 *         in: path
 *         description: The ID of the image to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the image
 *       404:
 *         description: Image not found
 */
serviceRouter.delete('/images/delete-image/:imageId', deleteImageById);

export { serviceRouter };
