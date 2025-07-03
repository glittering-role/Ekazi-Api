import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { Subscription } from "../../models/associations";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import paginate from "express-paginate";
import validatePagination from "../../../../utils/pagination/pagination";

// Fetch subscriptions with filters and pagination
const fetchSubscriptions = async (filters = {}, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await Subscription.findAndCountAll({
        where: filters,
        offset,
        limit
    });

    return {
        results: rows,
        itemCount: count
    };
};

// Get all subscriptions with pagination
export const getAllSubscriptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;

        const { page, limit } = pagination;

        // Calculate offset
        const offset = (page - 1) * limit;

        const { results, itemCount } = await fetchSubscriptions({}, page, limit);
        const pageCount = Math.ceil(itemCount / limit);

        res.status(200).json(createResponse(true, 'Subscriptions fetched successfully', {
            subscriptions: results,
            meta: {
                pageCount,
                itemCount,
                currentPage: page,
                hasMore: page < pageCount,
                pages: paginate.getArrayPages(req)(3, pageCount, page)
            }
        }));
    } catch (error) {
        handleError(error, req, res, 'Error fetching subscriptions');
    }
});

// Get a subscription by ID
export const getSubscriptionById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findByPk(id);

        if (subscription) {
             res.status(200).json(createResponse(true, 'Subscription retrieved successfully', {subscription}));
            return
        } else {
             res.status(404).json(createResponse(false, 'Subscription not found'));
            return
        }
    } catch (error) {
        handleError(error, req, res, 'Error fetching subscription by ID');
    }
});

// Get a subscription for the authenticated user by ID
export const getSubscriptionOfTheAuthUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromToken(req);

        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;

        const { page, limit } = pagination;

        // Calculate offset
        const offset = (page - 1) * limit;

        const { results, itemCount } = await fetchSubscriptions({ user_id: userId }, page, limit);
        const pageCount = Math.ceil(itemCount / limit);

         res.status(200).json(createResponse(true, 'Subscriptions retrieved successfully', {
            subscriptions: results,
            meta: {
                pageCount,
                itemCount,
                currentPage: page,
                hasMore: page < pageCount,
                pages: paginate.getArrayPages(req)(3, pageCount, page)
            }
        }));
    } catch (error) {
        handleError(error, req, res, 'Error fetching subscriptions by user ID');
    }
});

// Update a subscription by ID
export const updateSubscription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { user_id, plan_id, start_date, end_date, status, auto_renew } = req.body;

        const subscription = await Subscription.findByPk(id);

        if (!subscription) {
             res.status(404).json(createResponse(false, 'Subscription not found'));
            return
        }

        await subscription.update({
            user_id,
            plan_id,
            start_date,
            end_date,
            status,
            auto_renew
        });

         res.status(200).json(createResponse(true, 'Subscription updated successfully', {subscription}));
    } catch (error) {
        handleError(error, req, res, 'Error updating subscription');
    }
});

// Delete a subscription by ID
export const deleteSubscription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const subscription = await Subscription.findByPk(id);

        if (!subscription) {
             res.status(404).json(createResponse(false, 'Subscription not found'));
            return
        }

        await subscription.destroy();
         res.status(200).json(createResponse(true, 'Subscription deleted successfully'));

    } catch (error) {
        handleError(error, req, res, 'Error deleting subscription');
    }
});

export default {
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    getSubscriptionOfTheAuthUserById
};
