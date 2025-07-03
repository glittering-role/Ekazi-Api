import { RegisterUser } from '../../auth/register';
// import googleAuth from '../../auth/OtherAuths/googleAuth';
import {forgotPassword, resetPassword} from '../../auth/reset_password';

import express from 'express';
import { login } from "../../auth/login";
import { logout } from '../../auth/logout';
const AuthRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User security management
 */

/**
 * @swagger
 * /auth/sign-up:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       description: User registration details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Pa#ssword123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request. Validation errors or missing fields.
 *       500:
 *         description: Internal server error.
 */
AuthRouter.post('/sign-up', RegisterUser);


/**
 * @swagger
 * /auth/sign-in:
 *   post:
 *     summary: Log in a for web
 *     tags: [Authentication]
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Pa#ssword123
 *     responses:
 *       200:
 *         description: Successfully logged in. Returns a JWT token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       401:
 *         description: Unauthorized. Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
AuthRouter.post('/sign-in', login);


/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Authentication]
 *     requestBody:
 *       description: Email address to send the password reset link
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent to email.
 *       400:
 *         description: Bad request. Validation errors or invalid email.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
AuthRouter.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     tags: [Authentication]
 *     requestBody:
 *       description: New password, confirmation password, and reset token
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: NewP@ssw0rd
 *               token:
 *                 type: string
 *                 example: abc123def456
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Bad request. Passwords do not match or invalid token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
AuthRouter.post('/reset-password', resetPassword);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
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
 *                   example: Logged out successfully
 *       500:
 *         description: Internal Server Error.
 */
AuthRouter.post('/logout', logout);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Start the Google authentication process
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google login page.
 *       500:
 *         description: Internal server error.
 */

// // Google Authentication Routes
// AuthRouter.get('/google', googleAuth.authenticate('google', { scope: ['profile', 'email'] }));
//
// AuthRouter.get('/google/callback',
//     googleAuth.authenticate('google', { failureRedirect: '/auth/sign-in' }), (req, res) => {
//       res.redirect('/');
//     });




export default AuthRouter;