import express from 'express';
import {updateEmail, updatePassword, deleteAccount} from '../../controller/account/security';
import {verifyToken} from '../../middleware/jwt_auth';

const SecurityRouter = express.Router();


SecurityRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Security
 *   description: User security management
 */

/**
 * @swagger
 * /security/update-email:
 *   patch:
 *     summary: Update the email address of the authenticated user
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The new email address
 *                 example: newemail@example.com
 *     responses:
 *       200:
 *         description: Email updated successfully.
 *       400:
 *         description: Invalid email address.
 */
SecurityRouter.patch('/update-email', updateEmail);

/**
 * @swagger
 * /security/update-password:
 *   patch:
 *     summary: Update the password of the authenticated user
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: The current password
 *                 example: oldPassword123
 *               new_password:
 *                 type: string
 *                 description: The new password
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Invalid password.
 */
SecurityRouter.patch('/update-password', updatePassword);

/**
 * @swagger
 * /security/delete-account:
 *   delete:
 *     summary: Delete the current user's account
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: The current password of the user
 *     responses:
 *       200:
 *         description: Account marked for deletion. It will be permanently deleted after 30 days.
 *       400:
 *         description: Current password is incorrect or validation failed.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
SecurityRouter.delete('/delete-account', deleteAccount);

export default SecurityRouter;
