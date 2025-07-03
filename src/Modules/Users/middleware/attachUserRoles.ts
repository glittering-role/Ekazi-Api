import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
import { Roles, UserRoles } from "../model/associations";
import { asyncHandler } from "../../../middleware/async-middleware";
import { getUserIdFromToken } from "../../../utils/user/get_userId";

// Define a custom request interface that includes an optional user property
export interface CustomRequest extends Request {
    user?: {
        id: string;
        roles?: any[];
    };
}

export const attachUserRoles = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = getUserIdFromToken(req);
        if (!userId) {
             res.status(401).json({ message: 'User not authenticated' });
            return
        }

        // Cast req to CustomRequest
        const customReq = req as CustomRequest;
        // Initialize user if not already set
        if (!customReq.user) {
            customReq.user = { id: userId, roles: [] };
        }

        // Fetch user's roles from the UserRoles table
        const userRoles = await UserRoles.findAll({ where: { user_id: userId } });
        if (userRoles.length === 0) {
            customReq.user.roles = [];
            return next();
        }

        // Extract role IDs from userRoles
        const roleIds = userRoles.map((ur) => ur.role_id);

        // Fetch full role details using Sequelize's [Op.in] operator
        customReq.user.roles = await Roles.findAll({
            where: {
                id: { [Op.in]: roleIds },
            },
        });

        return next();
    }
);
