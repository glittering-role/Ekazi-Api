import express from 'express';

import {getAllNotifications, deleteNotification} from '../../controllers/generalNotifications';
import {getUserNotifications, deleteUserNotification} from '../../controllers/usersNotifications';
import {verifyToken} from '../../../Users/middleware/jwt_auth';
import { markAsReadNotifications } from '../../controllers/mark_as_read';

const notificationsRoutes = express.Router();

notificationsRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage user notifications
 */

/**
 * @swagger
 * /notifications/get-all:
 *   get:
 *     summary: Get all notifications with pagination
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: List of all notifications with pagination details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       user_id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       message:
 *                         type: string
 *                         example: You have a new message
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-05T12:34:56Z
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
 *       500:
 *         description: Internal server error
 */
notificationsRoutes.get('/get-all', getAllNotifications);

/**
 * @swagger
 * /notifications/delete:
 *   delete:
 *     summary: Delete notifications by ID or batch
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The UUID of the notification to delete (for single deletion)
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of UUIDs for batch deletion
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               ids: ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
 *     responses:
 *       200:
 *         description: Notification(s) deleted successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
notificationsRoutes.delete('/delete', deleteNotification);



/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Manage user notifications
 */

/**
 * @swagger
 * /notifications/get-user-notifications:
 *   get:
 *     summary: Get all unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Unread notifications retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       user_id:
 *                         type: string
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       message:
 *                         type: string
 *                         example: You have a new message
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-09-05T12:34:56Z
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       500:
 *         description: Internal server error.
 */
notificationsRoutes.get('/get-user-notifications', getUserNotifications);

/**
 * @swagger
 * /notifications/delete-user-notification:
 *   delete:
 *     summary: Delete notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The UUID of the notification to delete (for single deletion)
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of UUIDs for batch deletion
 *             example:
 *               id: "550e8400-e29b-41d4-a716-446655440000"
 *               ids: ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"]
 *     responses:
 *       200:
 *         description: Notification(s) deleted successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Internal server error
 */
notificationsRoutes.delete('/delete-user-notification' , deleteUserNotification);

notificationsRoutes.post('/mark-as-read' , markAsReadNotifications);

export default notificationsRoutes;
