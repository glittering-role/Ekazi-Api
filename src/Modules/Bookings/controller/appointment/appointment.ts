import { Request, Response } from "express";
import { Op } from "sequelize";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import Booking from "../../models/booking";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import validatePagination from "../../../../utils/pagination/pagination";
import paginate from "express-paginate";
import { UserDetails, Users } from "../../../Users/model/associations";
import { Service } from "../../../Services/models/associations";
import { JobCategory, JobSubCategory } from "../../../JobCategories/models/association";

/**
 * Get all bookings where the user is either a customer or service provider.
 * Users can filter by status, start/end date, and use pagination.
 */

const include = [
    {
        model: Users,
        as: 'user',
        attributes: ['id', 'email'],
        include: [{
            model: UserDetails,
            attributes: ['first_name', 'last_name', 'image']
        }]
    },
    {
        model: Users,
        as: 'provider',
        attributes: ['id', 'email', 'phone_number' ,],
        include: [{
            model: UserDetails,
            attributes: ['first_name', 'last_name', 'image']
        }]
    },
    {
        model: Service,
        as: 'service',
        attributes: ['title', 'price_from', 'price_to' , 'location', 'status', 'sub_category_id'],
        include: [{
            model: JobSubCategory,
            as: 'subcategory',
            attributes: ['id', 'job_subcategory_name'],
            include: [
                {
                    model: JobCategory,
                    as: 'category',
                    attributes: ['id', 'job_category_name'],
                },
            ],
        }]
    }
];

export const getBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        // Validate and get pagination values
        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;
        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        // Extract filters from query parameters
        const { status, start_date, end_date } = req.query;

        // Build the search conditions
        const whereConditions: any = {
            [Op.or]: [{ user_id }, { provider_id: user_id }],
        };

        // Filter by status if provided
        if (status && typeof status === "string") {
            whereConditions.status = status;
        }

        // Filter by date range if provided
        if (start_date && end_date) {
            whereConditions.start_time = {
                [Op.between]: [new Date(start_date as string), new Date(end_date as string)],
            };
        } else if (start_date) {
            whereConditions.start_time = { [Op.gte]: new Date(start_date as string) };
        } else if (end_date) {
            whereConditions.start_time = { [Op.lte]: new Date(end_date as string) };
        }

        // Fetch paginated and filtered bookings
        const { rows: bookings, count: itemCount } = await Booking.findAndCountAll({
            where: whereConditions,
            attributes: ["id", "service_id",  "provider_id", "user_id", "start_time", "end_time", "status", "created_at"],
            include,
            order: [["start_time", "DESC"]],
            limit,
            offset,
        });

        // Calculate pagination metadata
        const pageCount = Math.ceil(itemCount / limit);

        res.status(200).json(
            createResponse(true, "Bookings retrieved successfully", {
                bookings,
                meta: {
                    pageCount,
                    itemCount,
                    currentPage: page,
                    hasMore: paginate.hasNextPages(req)(pageCount),
                    pages: paginate.getArrayPages(req)(3, pageCount, page),
                },
            })
        );
    } catch (error) {
        handleError(error, req, res, "Error retrieving bookings");
    }
});
