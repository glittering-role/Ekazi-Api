import express from 'express';
import { getLogs, deleteLogsByDate, deleteAllLogs } from '../../controller/loggingController';
// import { checkRole } from '../../../User/middleware/checkRoles';
// import { verifyToken } from '../../../User/middleware/jwtAuth';

const LogsRoute = express.Router();

//LogsRoute.use(verifyToken , checkRole('logs:view'))

/**
 * @swagger
 * tags:
 *   name: logs
 *   description: Manage logs for the application
 */

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Fetch logs based on log level
 *     tags: [logs]
 *     parameters:
 *       - in: query
 *         name: logLevel
 *         required: true
 *         description: The log level to filter logs (e.g., 'info', 'warn', 'error')
 *         schema:
 *           type: string
 *           example: info
 *     responses:
 *       200:
 *         description: Successfully retrieved logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   timestamp:
 *                     type: string
 *                   level:
 *                     type: string
 *                   message:
 *                     type: string
 *                   metadata:
 *                     type: object
 *       400:
 *         description: Invalid or missing log level
 *       500:
 *         description: Internal server error
 */
LogsRoute.get('/',  getLogs);


// @ts-ignore
/**
 * @swagger
 * /logs/delete-logs-by-date:
 *   delete:
 *     summary: Delete logs by specific dates
 *     tags: [logs]
 *     parameters:
 *       - in: query
 *         name: dates
 *         required: true
 *         description: JSON array of dates to delete logs for. Each date must be in ISO 8601 format.
 *         schema:
 *           type: string
 *           example: '["2025-01-01T00:00:00Z", "2025-01-02T00:00:00Z"]'
 *     responses:
 *       200:
 *         description: logs deleted successfully.
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
 *                   example: "logs deleted successfully"
 *       400:
 *         description: Invalid or missing dates array.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid dates format. Provide a valid JSON array of dates."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error deleting logs"
 */
LogsRoute.delete('/delete-logs-by-date', deleteLogsByDate);


/**
 * @swagger
 * /logs/delete-all-logs:
 *   delete:
 *     summary: Delete all logs
 *     tags: [logs]
 *     responses:
 *       200:
 *         description: All logs deleted successfully
 *       500:
 *         description: Internal server error
 */
LogsRoute.delete('/delete-all-logs', deleteAllLogs);

export default LogsRoute;
