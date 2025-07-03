import express from 'express';
import { verifyToken } from '../../../Users/middleware/jwt_auth';
import { createBooking } from '../../controller/bookings/create_booking';
import { updateBooking } from '../../controller/bookings/update_booking';
import {attendBooking, cancelBooking, confirmOrCancelBooking} from '../../controller/bookings/confirm_booking';
// import { rebook } from '../../controller/bookings/rebook';


const BookingRoutes = express.Router();

BookingRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Manage service bookings
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: Start time of the booking
 *                 example: "2024-12-25T09:00:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: End time of the booking
 *                 example: "2024-12-25T10:00:00Z"
 *               service_id:
 *                 type: string
 *                 description: ID of the service
 *                 example: "service-uuid"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Provider is unavailable or there is a conflict with another booking
 */
BookingRoutes.post('/', createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking (only by the service provider)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 description: (Optional) Updated start time
 *                 example: "2024-12-25T09:30:00Z"
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 description: (Optional) Updated end time
 *                 example: "2024-12-25T10:30:00Z"
 *               service_id:
 *                 type: string
 *                 description: (Optional) Updated service id if applicable
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       403:
 *         description: Only the service provider can update this booking
 *       400:
 *         description: Provider is unavailable or there is a conflict with another booking
 */
BookingRoutes.put('/:id', updateBooking);

/**
 * @swagger
 * /bookings/{id}/action:
 *   patch:
 *     summary: Confirm or cancel a booking
 *     description: Allows a service provider to confirm a booking and a user to cancel a pending booking.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID to confirm or cancel
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [confirm, cancel]
 *                 description: "Specify 'confirm' to confirm the booking or 'cancel' to cancel a pending booking."
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 booking:
 *                   type: object
 *                   description: The updated booking details.
 *       400:
 *         description: Invalid request (e.g., trying to cancel a confirmed booking)
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Booking not found
 */

BookingRoutes.patch('/:id/action', confirmOrCancelBooking);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking for a user
 *     description: Allows a user to cancel their own booking before it is completed.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID to cancel
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Cannot cancel a completed booking
 *       403:
 *         description: Unauthorized action
 *       404:
 *         description: Booking not found
 */
BookingRoutes.patch('/:id/cancel', cancelBooking);

/**
 * @swagger
 * /bookings/{id}/attend:
 *   patch:
 *     summary: Attend to a booking (only by the service provider)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking ID to attend
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking attended successfully
 *       403:
 *         description: Only the service provider can attend to this booking
 *       400:
 *         description: Booking must be confirmed before attending
 *       404:
 *         description: Booking not found
 */
BookingRoutes.patch('/:id/attend', attendBooking);

// /**
//  * @swagger
//  * /bookings/{id}/rebook:
//  *   post:
//  *     summary: Rebook a cancelled booking
//  *     tags: [Bookings]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         description: Original Booking ID to rebook
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               start_time:
//  *                 type: string
//  *                 format: date-time
//  *                 description: New start time for the booking
//  *                 example: "2024-12-25T09:00:00Z"
//  *               end_time:
//  *                 type: string
//  *                 format: date-time
//  *                 description: New end time for the booking
//  *                 example: "2024-12-25T10:00:00Z"
//  *     responses:
//  *       201:
//  *         description: Booking rebooked successfully
//  *       400:
//  *         description: Booking cannot be rebooked or there is a conflict with another booking
//  *       404:
//  *         description: Original booking not found
//  */
// BookingRoutes.post('/:id/rebook', rebook);

export default BookingRoutes;
