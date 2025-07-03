import express from 'express';
import {
    createBlockedDate,
    getBlockedDates,
    updateBlockedDate,
    deleteBlockedDate
} from '../../controller/manage/blocked_dates';
import { verifyToken } from '../../../Users/middleware/jwt_auth';

const BlockedDateRoutes = express.Router();

BlockedDateRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Blocked Dates
 *   description: Manage service provider's blocked dates
 */

/**
 * @swagger
 * /blocked-dates:
 *   post:
 *     summary: Block a date
 *     tags: [Blocked Dates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blocked_date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-25
 *               reason:
 *                 type: string
 *                 example: Christmas holiday
 *     responses:
 *       201:
 *         description: Date blocked successfully
 *       400:
 *         description: Invalid date or past date
 *       409:
 *         description: Date already blocked
 */
BlockedDateRoutes.post('/', createBlockedDate);

/**
 * @swagger
 * /blocked-dates:
 *   get:
 *     summary: Get all blocked dates
 *     tags: [Blocked Dates]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of blocked dates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blockedDates:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BlockedDate'
 */
BlockedDateRoutes.get('/', getBlockedDates);

/**
 * @swagger
 * /blocked-dates/{id}:
 *   put:
 *     summary: Update blocked date
 *     tags: [Blocked Dates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               blocked_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blocked date updated
 *       404:
 *         description: Block not found
 */
BlockedDateRoutes.put('/:id', updateBlockedDate);

/**
 * @swagger
 * /blocked-dates/{id}:
 *   delete:
 *     summary: Unblock a date
 *     tags: [Blocked Dates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Date unblocked
 *       404:
 *         description: Block not found
 */
BlockedDateRoutes.delete('/:id', deleteBlockedDate);

export default BlockedDateRoutes;