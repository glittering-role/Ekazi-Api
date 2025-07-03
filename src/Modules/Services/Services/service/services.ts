// Get all services with pagination
import { Request, Response } from "express";
import {asyncHandler} from "../../../../middleware/async-middleware";
import validatePagination from "../../../../utils/pagination/pagination";
import Service from "../../models/services";
import ServiceImage from "../../models/service_images";
import {createResponse} from "../../../../logs/helpers/response";
import {handleError} from "../../../../logs/helpers/erroHandler";
import paginate from "express-paginate";

export const getAllServices = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;

        const { page, limit } = pagination;

        // Calculate offset
        const offset = (page - 1) * limit;

        // Fetch paginated results
        const [services, itemCount] = await Promise.all([
            Service.findAll({
                include: [{
                    model: ServiceImage,
                    as: 'images',
                    attributes: ['id', 'image_url', 'is_primary'],
                
                }],
                offset,
                limit,
            }),
            Service.count(),
        ]);

        const pageCount = Math.ceil(itemCount / limit);

        res.status(200).json(createResponse(true, 'Services retrieved successfully', {
            services,
            meta: {
                pageCount,
                itemCount,
                currentPage: page,
                hasMore: paginate.hasNextPages(req)(pageCount),
                pages: paginate.getArrayPages(req)(3, pageCount, page),
            }
        }));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while fetching services');
    }
});
