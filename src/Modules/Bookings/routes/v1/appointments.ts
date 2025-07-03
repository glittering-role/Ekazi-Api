import express from "express";
import { verifyToken } from "../../../Users/middleware/jwt_auth";
import { getBookings } from "../../controller/appointment/appointment";

const AppointmentRoutes = express.Router();

// Apply authentication middleware to all routes
AppointmentRoutes.use(verifyToken);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Retrieve all bookings of the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of bookings per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter bookings by status.
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings starting from this date.
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bookings up to this date.
 *     responses:
 *       200:
 *         description: Successfully retrieved user bookings
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
 *                     bookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           service_id:
 *                             type: string
 *                           provider_id:
 *                             type: string
 *                           user_id:
 *                             type: string
 *                           start_time:
 *                             type: string
 *                             format: date-time
 *                           end_time:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [pending, confirmed, cancelled, completed]
 *                     meta:
 *                       type: object
 *                       properties:
 *                         pageCount:
 *                           type: integer
 *                         itemCount:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         hasMore:
 *                           type: boolean
 *                         pages:
 *                           type: array
 *                           items:
 *                             type: integer
 *       400:
 *         description: User ID is required or invalid query parameters
 *       500:
 *         description: Error retrieving user bookings
 */
AppointmentRoutes.get("/", getBookings);

export default AppointmentRoutes;
