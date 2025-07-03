import { Request, Response } from 'express';
import { Roles, UserDetails, Users } from '../model/associations';
import paginate from 'express-paginate';
import { asyncHandler } from '../../../middleware/async-middleware';
import { handleError } from '../../../logs/helpers/erroHandler';
import { createResponse } from '../../../logs/helpers/response';
import logger from '../../../logs/helpers/logger';

export const getRolesWithUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const selectedRole = req.params.role;
    const pageNumber = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.limit as string, 10) || 100;

    if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
      const errorMessage = isNaN(pageNumber) || pageNumber < 1
          ? 'Invalid page number, should start with 1'
          : 'Invalid limit number, should be at least 1';
      logger.error(errorMessage, { method: req.method, route: req.originalUrl });
      res.status(400).json(createResponse(false, errorMessage));
      return;
    }

    const offset = (pageNumber - 1) * pageSize;

    // Fetch roles along with associated users and count, filtering by selected role
    const { count: itemCount, rows: roles } = await Roles.findAndCountAll({
      where: { role_name: selectedRole }, // Filter by the selected role
      include: [
        {
          model: Users,
          as: 'Users',
          attributes: ['id', 'email', 'isActive'],
          include: [
            {
              model: UserDetails,
              attributes: ['id', 'first_name', 'last_name', 'image'],
            },
            {
              model: Roles,
              as: 'Roles',
              attributes: ['id', 'role_name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
      offset,
      limit: pageSize,
    });

    const pageCount = Math.ceil(itemCount / pageSize);

    const rolesWithUserCount = roles.map((role: any) => ({
      id: role.id,
      role_name: role.role_name,
      user_count: role.Users.length,
      users: role.Users,
    }));

    res.status(200).json(
        createResponse(true, 'Roles with users fetched successfully', {
          roles: rolesWithUserCount,
          meta: {
            pageCount,
            itemCount,
            currentPage: pageNumber,
            hasMore: pageNumber < pageCount,
            pages: paginate.getArrayPages(req)(3, pageCount, pageNumber),
          },
        })
    );
  } catch (error) {
    handleError(error, req, res, 'An error occurred while fetching roles');
  }
});

