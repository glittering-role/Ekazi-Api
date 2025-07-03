import { Request, Response } from 'express';
import { asyncHandler } from '../../../../middleware/async-middleware';
import { handleError } from '../../../../logs/helpers/erroHandler';
import { createResponse } from '../../../../logs/helpers/response';
import {Users, UserDetails, Roles, UserLocation} from '../../model/associations';
import paginate from 'express-paginate';
import validatePagination from "../../../../utils/pagination/pagination";



// Reusable function to fetch users with pagination and optional search conditions
const fetchUsers = async (
    whereCondition: Record<string, any>,
    page: number,
    limit: number
): Promise<{ results: any[]; itemCount: number }> => {
  const offset = (page - 1) * limit;

  const [results, itemCount] = await Promise.all([
    Users.findAll({
      where: whereCondition,
      attributes : ["id", "email", "username" , "authType", "status", "createdAt"],
      offset,
      limit,
      include: [
        {
          model: UserDetails,
          attributes: [
            'first_name',
            'middle_name',
            'last_name',
            'gender',
            'image',
            'about_the_user',
          ],
        },
        {
          model: Roles,
          as: "Roles",
          attributes: ["id", "role_name"],
          through: { attributes: [] },
        },
        {
          model: UserLocation,
          attributes: ['country', 'state_name', 'continent', 'city', 'zip']
        }
      ],
    }),
    Users.count({ where: whereCondition }),
  ]);

  return { results, itemCount };
};

// Fetch all users
const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = validatePagination(req, res, 1, 20);
    if (!pagination) return;

    const { page, limit } = pagination;

    const { results, itemCount } = await fetchUsers({}, page, limit);
    const pageCount = Math.ceil(itemCount / limit);

    res.status(200).json(
        createResponse(true, 'Users fetched successfully', {
          users: results,
          meta: {
            pageCount,
            itemCount,
            currentPage: page,
            hasMore: page < pageCount,
            pages: paginate.getArrayPages(req)(3, pageCount, page),
          },
        })
    );
  } catch (error) {
    handleError(error, req, res, 'An error occurred while fetching users');
  }
});

export { getAllUsers };
