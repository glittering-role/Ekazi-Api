import { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-middleware";
import { getUserIdFromToken } from "../../../utils/user/get_userId";
import { Service, ServiceOrder } from "../models/associations";
import { UserDetails, Users } from "../../Users/model/associations";
import { createResponse } from "../../../logs/helpers/response";
import { handleError } from "../../../logs/helpers/erroHandler";
import validatePagination from "../../../utils/pagination/pagination";
import paginate from "express-paginate";
import { Op } from "sequelize";

/**
 * Define a CustomRequest interface that includes an optional user property.
 */
interface CustomRequest extends Request {
    user?: {
        id: string;
        roles?: { role_name: string }[];
    };
}

/**
 * Helper function to fetch orders based on the user's roles.
 */
const customGetOrders = async (
    userId: string,
    trackingNumber?: string,
    date?: string,
    status?: string,
    limit?: number,
    offset?: number,
    isProvider?: boolean,
    isUser?: boolean
) => {
    const whereClause: any = {};

    // Role-based filtering:
    if (isProvider && !isUser) {
        whereClause.provider_user_id = userId;
    } else if (!isProvider && isUser) {
        whereClause.client_user_id = userId;
    } else if (isProvider && isUser) {
        whereClause[Op.or] = [
            { client_user_id: userId },
            { provider_user_id: userId },
        ];
    } else {
        // Fallback to client orders if no roles exist
        whereClause.client_user_id = userId;
    }

    // Additional filters
    if (trackingNumber) {
        whereClause.tracking_number = trackingNumber;
    }
    if (date) {
        whereClause.requested_at = {
            [Op.gte]: new Date(date + " 00:00:00"),
            [Op.lte]: new Date(date + " 23:59:59"),
        };
    }
    if (status) {
        whereClause.status = status;
    }

    // Default: Show orders from the last week if no filters applied
    if (!trackingNumber && !date && !status) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        if (!whereClause.requested_at) {
            whereClause.requested_at = { [Op.gte]: oneWeekAgo };
        }
    }

    return await ServiceOrder.findAndCountAll({
        where: whereClause,
        include: [
            {
                model: Service,
                as: 'service',
                attributes: ['title', 'description', 'pricing_mode', 'price_from', 'price_to' , 'status', 'service_location_preference'],
            },
            {
                model: Users,
                as: 'client',
                attributes: ['id', 'username', 'email', 'phone_number'],
                include: [{
                    model: UserDetails,
                    attributes: ["first_name", "middle_name", "last_name", "gender", "image"],
                }]
            },
            {
                model: Users,
                as: 'serviceProviderUser',
                attributes: ['id', 'username', 'email'],
                include: [{
                    model: UserDetails,
                    attributes: ["first_name", "middle_name", "last_name", "gender", "image"],
                }]
            },

        ],
        order: [['requested_at', 'DESC']],
        limit,
        offset,
    });
};

/**
 * Get orders for the logged-in user.
 * Note: We use the default Request in the signature and cast to CustomRequest.
 */
export const getOrders = asyncHandler(
    async (req: Request, res: Response ): Promise<void> => {
        try {
            // Cast req to CustomRequest so we can access the user property.
            const customReq = req as CustomRequest;


            const userId = getUserIdFromToken(customReq);

            if (!userId) {
                 res.status(401).json({ message: 'User not authenticated' });
                return
            }
            if (!customReq.user) {
                 res.status(403).json({ message: "User roles not available" });
                return
            }

            // Extract roles from req.user.
            const roles = customReq.user.roles || [];
            const isProvider = roles.some((role) => role.role_name === 'service_provider');
            const isUser = roles.some((role) => role.role_name === 'user');

            // Validate pagination.
            const pagination = validatePagination(customReq, res, 1, 20);
            if (!pagination) return;
            const { page, limit } = pagination;
            const offset = (page - 1) * limit;

            // Get optional filters from query.
            const { trackingNumber, date, status } = req.query;

            // Fetch orders using our custom helper.
            const { count: itemCount, rows: orders } = await customGetOrders(
                userId,
                trackingNumber as string,
                date as string,
                status as string,
                limit,
                offset,
                isProvider,
                isUser
            );

            // Ensure orders exist before processing
            if (!orders) {
                 res.status(404).json({ message: "No orders found" });
                return
            }

            // Map through orders to append user role info and control details visibility.
            const ordersWithUserRole = orders.map(order => {
                try {
                    // Convert order instance to plain object.
                    const orderObj = order.toJSON();
                    let userRole = "";

                    // Determine user role.
                    if (orderObj.client && orderObj.client.id === userId) {
                        userRole = "client";
                    }
                    if (orderObj.serviceProviderUser && orderObj.serviceProviderUser.id === userId) {
                        userRole = userRole ? "client & provider" : "provider";
                    }

                    // Apply conditional logic based on order status.
                    if (orderObj.status !== "accepted") {
                        if (userRole === "provider" && orderObj.client) {
                            orderObj.client.email = '';
                            if (orderObj.client.UserDetails) {
                                orderObj.client.UserDetails = {
                                    first_name: orderObj.client.UserDetails.first_name,
                                };
                            }
                        }

                        if (userRole === "client" && orderObj.serviceProviderUser) {
                            orderObj.serviceProviderUser.email = '';
                            orderObj.serviceProviderUser.phone_number = undefined;
                            if (orderObj.serviceProviderUser.UserDetails) {
                                orderObj.serviceProviderUser.UserDetails = {
                                    first_name: orderObj.serviceProviderUser.UserDetails.first_name,
                                };
                            }
                        }
                    }
                    return { ...orderObj, userRole };
                } catch (error) {
                    console.error("Error processing order:", error);
                    return null;
                }
            }).filter(order => order !== null); // Remove any null entries due to errors.

            const pageCount = Math.ceil(itemCount / limit);

             res.status(200).json(createResponse(true, "Orders retrieved successfully", {
                orders: ordersWithUserRole,
                meta: {
                    pageCount,
                    itemCount,
                    currentPage: page,
                    hasMore: paginate.hasNextPages(req)(pageCount),
                    pages: paginate.getArrayPages(req)(3, pageCount, page),
                }
            }));
        } catch (error) {
            handleError(error, req, res, 'An error occurred while fetching orders');
        }
    }
);
