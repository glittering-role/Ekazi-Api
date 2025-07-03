import {asyncHandler} from "../../../middleware/async-middleware";
import {Request, Response} from "express";
import { Users, Roles, UserRoles } from '../model/associations';
import {ValidationError} from 'sequelize';
import {handleError} from "../../../logs/helpers/erroHandler";
import {createResponse} from "../../../logs/helpers/response";

// Assign a role to a user
const assignRoleToUser= asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
         res.status(400).json(createResponse(false, 'User ID and Role ID are required'));
        return
    }

    try {
        // Check if the role exists and is active
        const role = await Roles.findOne({
            where: {
                id: roleId,
                role_status: true
            }
        });

        if (!role) {
             res.status(404).json(createResponse(false, 'Role not found or inactive'));
            return
        }

        // Check if the user exists
        const user = await Users.findByPk(userId);
        if (!user) {
             res.status(404).json(createResponse(false, 'User not found'));
            return
        }

        // Check if the role is already assigned
        const existingUserRole = await UserRoles.findOne({
            where: {
                user_id: userId,
                role_id: roleId
            }
        });

        if (existingUserRole) {
             res.status(400).json(createResponse(false, 'Role is already assigned to this user'));
            return
        }

        // Assign the role to the user
        await UserRoles.create({
            user_id: userId,
            role_id: roleId
        });

        res.status(201).json(createResponse(true, 'Role assigned to user successfully'));

    } catch (error) {
        if (error instanceof ValidationError) {
            handleError(error, req, res, 'Validation error');
        }
        handleError(error, req, res, 'An error occurred while assigning role to user');
    }
});

// Remove a role from a user
const removeRoleFromUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
         res.status(400).json(createResponse(false, 'User ID and Role ID are required'));
        return
    }

    try {
        // Check if the user has the role
        const userRole = await UserRoles.findOne({
            where: {
                user_id: userId,
                role_id: roleId
            }
        });

        if (!userRole) {
             res.status(404).json(createResponse(false, 'Role not found for this user'));
            return
        }
        // Remove the role from the user
        await userRole.destroy();

        res.status(200).json(createResponse(true, 'Role removed from user successfully'));

    } catch (error) {
        if (error instanceof ValidationError) {
            handleError(error, req, res, 'Validation error');
        }

        handleError(error, req, res, 'An error occurred while removing the profile picture');
    }
});

 export {
    assignRoleToUser,
    removeRoleFromUser
};