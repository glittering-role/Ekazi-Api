const express = require('express');

import { getAllUsers } from "../../controller/user/user";
const UserRouter = express.Router();

import {verifyToken} from '../../middleware/jwt_auth';

UserRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: User
 *   description: The user managing API
 */

/**
 * @swagger
 * /user/get-all-users:
 *   get:
 *     summary: Retrieve all users
 *     tags: [User]
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 */
UserRouter.get('/get-all-users', getAllUsers);


export default UserRouter;
