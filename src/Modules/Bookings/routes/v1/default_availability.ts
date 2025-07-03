import express from 'express';
import {
    createDefaultAvailability,
    getProviderAvailability,
    updateDefaultAvailability,
    deleteDefaultAvailability
} from '../../controller/manage/default_availability';
import { verifyToken } from '../../../Users/middleware/jwt_auth';
import { getProviderCalendar } from "../../controller/appointment/get_provider_calendar";

const DefaultAvailabilityRoutes = express.Router();

DefaultAvailabilityRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Default Availability
 *   description: Manage service providers' default availability schedules
 */

/**
 * @swagger
 * /default-availability:
 *   post:
 *     summary: Create a new default availability schedule
 *     tags: [Default Availability]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selected_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2023-10-01", "2023-10-03", "2023-10-05"]
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "17:00:00"
 *     responses:
 *       201:
 *         description: Default availability created successfully.
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
 *                   example: Default availability created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     provider_id:
 *                       type: string
 *                     selected_dates:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields or invalid input.
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       409:
 *         description: Conflict. Availability already exists.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /default-availability/{provider_id}:
 *   get:
 *     summary: Retrieve calendar availability info for a service provider
 *     tags: [Default Availability]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider_id
 *         required: true
 *         description: Service provider's ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: The month (1-12) for which calendar availability is requested.
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *           maximum: 2100
 *         description: The year for which calendar availability is requested.
 *     responses:
 *       200:
 *         description: Calendar info retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     calendarEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           start:
 *                             type: string
 *                             format: date-time
 *                           end:
 *                             type: string
 *                             format: date-time
 *                           allDay:
 *                             type: boolean
 *                           backgroundColor:
 *                             type: string
 *                           borderColor:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [free, booked, blocked]
 *       400:
 *         description: Provider ID is required or invalid month/year.
 *       500:
 *         description: Error retrieving calendar info.
 */

/**
 * @swagger
 * /default-availability:
 *   get:
 *     summary: Get all default availabilities for the logged-in provider
 *     tags: [Default Availability]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Default availabilities retrieved successfully.
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
 *                   example: Default availabilities retrieved successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     availabilities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           provider_id:
 *                             type: string
 *                           selected_dates:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: date
 *                           start_time:
 *                             type: string
 *                           end_time:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /default-availability/{id}:
 *   put:
 *     summary: Update a default availability schedule
 *     tags: [Default Availability]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selected_dates:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: date
 *                 example: ["2023-11-01", "2023-11-03", "2023-11-05"]
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "10:00:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "18:00:00"
 *     responses:
 *       200:
 *         description: Default availability updated successfully.
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
 *                   example: Default availability updated successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     provider_id:
 *                       type: string
 *                     selected_dates:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: date
 *                     start_time:
 *                       type: string
 *                     end_time:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request. Required fields are missing or invalid.
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       404:
 *         description: Not found. Availability not found.
 *       409:
 *         description: Conflict. Availability already exists.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /default-availability/{id}:
 *   delete:
 *     summary: Delete a default availability schedule or a specific date from it
 *     tags: [Default Availability]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       description: Optional. Provide a specific date (YYYY-MM-DD) to remove that date from the schedule. If not provided, the entire schedule is deleted. If the removal of the specific date results in an empty schedule, the entire record is deleted.
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-10-01"
 *     responses:
 *       200:
 *         description: Default availability deleted successfully.
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
 *                   example: Default availability deleted successfully.
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       404:
 *         description: Not found. Availability not found.
 *       500:
 *         description: Internal server error.
 */

DefaultAvailabilityRoutes.post('/', createDefaultAvailability);
DefaultAvailabilityRoutes.get('/:provider_id', getProviderCalendar);
DefaultAvailabilityRoutes.get('/', getProviderAvailability);
DefaultAvailabilityRoutes.put('/:id', updateDefaultAvailability);
DefaultAvailabilityRoutes.delete('/:id', deleteDefaultAvailability);

export default DefaultAvailabilityRoutes;
