import express from 'express';
import {
    createAvailabilityOverride,
    getAvailabilityOverrides,
    updateAvailabilityOverride,
    deleteAvailabilityOverride
} from '../../controller/manage/availability_override';
import { verifyToken } from '../../../Users/middleware/jwt_auth';

const AvailabilityOverrideRoutes = express.Router();

AvailabilityOverrideRoutes.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Availability Overrides
 *   description: Manage service provider's availability overrides
 */

/**
 * @swagger
 * /availability-overrides:
 *   post:
 *     summary: Override availability for a specific date
 *     tags: [Availability Overrides]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               override_date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-25
 *               reason:
 *                 type: string
 *                 example: Special event
 *     responses:
 *       201:
 *         description: Availability override created successfully
 *       400:
 *         description: Invalid date or past date
 *       409:
 *         description: Override already exists
 */
AvailabilityOverrideRoutes.post('/', createAvailabilityOverride);

/**
 * @swagger
 * /availability-overrides:
 *   get:
 *     summary: Get all availability overrides
 *     tags: [Availability Overrides]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of availability overrides
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
 *                     availabilityOverrides:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AvailabilityOverride'
 */
AvailabilityOverrideRoutes.get('/', getAvailabilityOverrides);

/**
 * @swagger
 * /availability-overrides/{id}:
 *   put:
 *     summary: Update an availability override
 *     tags: [Availability Overrides]
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
 *               override_date:
 *                 type: string
 *                 format: date
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Availability override updated
 *       404:
 *         description: Override not found
 */
AvailabilityOverrideRoutes.put('/:id', updateAvailabilityOverride);

/**
 * @swagger
 * /availability-overrides/{id}:
 *   delete:
 *     summary: Remove an availability override
 *     tags: [Availability Overrides]
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
 *         description: Availability override removed
 *       404:
 *         description: Override not found
 */
AvailabilityOverrideRoutes.delete('/:id', deleteAvailabilityOverride);

export default AvailabilityOverrideRoutes;
