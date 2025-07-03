import {
  getRoles,
  createRole,
  deleteRole,
  getRoleById,
  updateRoleName,
  updateRoleStatus,
} from '../../authorization/roles';

import {assignRoleToUser, removeRoleFromUser} from "../../authorization/grantRoles";

import express from 'express';
const RolesRouter = express.Router();

import {verifyToken} from '../../middleware/jwt_auth';
import { getRolesWithUsers } from '../../authorization/rolesWithUsers';

//RolesRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: The roles managing API
 */

/**
 * @swagger
 * /roles/get-roles:
 *   get:
 *     tags: [Roles]
 *     summary: Retrieve a list of roles
 *     description: This endpoint returns all roles available in the system.
 *     responses:
 *       200:
 *         description: Successfully retrieved roles
 *       500:
 *         description: Internal server error
 */
RolesRouter.get('/get-roles', getRoles);

/**
 * @swagger
 * /roles/create-role:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     description: This endpoint allows for the creation of a new role.
 *     requestBody:
 *       description: Role creation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad request. Validation errors or missing fields.
 *       500:
 *         description: Internal server error
 */
RolesRouter.post('/create-role', createRole);

/**
 * @swagger
 * /roles/delete-role/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role by ID
 *     description: This endpoint deletes a role by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
RolesRouter.delete('/delete-role/:id', deleteRole);

/**
 * @swagger
 * /roles/update-role-name/{id}:
 *   put:
 *     tags: [Roles]
 *     summary: Update a role's name
 *     description: This endpoint updates the name of a role by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to update
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Role update details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newRoleName:
 *                 type: string
 *                 example: Super Admin
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
RolesRouter.put('/update-role-name/:id', updateRoleName);

/**
 * @swagger
 * /roles/update-role-status/{id}/status:
 *   patch:
 *     tags: [Roles]
 *     summary: Update a role's status
 *     description: This endpoint updates the status of a role by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to update status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role status updated successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
RolesRouter.patch('/update-role-status/:id/status', updateRoleStatus);


/**
 * @swagger
 * /roles/assign-role-to-user:
 *   post:
 *     tags: [Roles]
 *     summary: Assign a role to a user
 *     description: This endpoint assigns a specified role to a user.
 *     requestBody:
 *       description: User and role assignment details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "12345"
 *               roleId:
 *                 type: string
 *                 example: "67890"
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       400:
 *         description: Bad request. Validation errors or missing fields.
 *       500:
 *         description: Internal server error
 */
RolesRouter.post('/assign-role-to-user', assignRoleToUser);

/**
 * @swagger
 * /roles/remove-role-from-user:
 *   post:
 *     tags: [Roles]
 *     summary: Remove a role from a user
 *     description: This endpoint removes a specified role from a user.
 *     requestBody:
 *       description: User and role removal details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "12345"
 *               roleId:
 *                 type: string
 *                 example: "67890"
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       400:
 *         description: Bad request. Validation errors or missing fields.
 *       500:
 *         description: Internal server error
 */
RolesRouter.post('/remove-role-from-user', removeRoleFromUser);

/**
 * @swagger
 * /roles/get-role-by-id/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Retrieve a role by its ID
 *     description: This endpoint returns a specific role by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the role to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
RolesRouter.get('/get-role-by-id/:id', getRoleById);

RolesRouter.get('/get-role-with-users/:role',  getRolesWithUsers);

export default RolesRouter;

