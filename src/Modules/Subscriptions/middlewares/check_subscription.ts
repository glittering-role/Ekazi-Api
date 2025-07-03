// middlewares/checkServiceLimit.ts
import {asyncHandler} from "../../../middleware/async-middleware";
import {NextFunction, Request, Response} from "express";
import {createResponse} from "../../../logs/helpers/response";
import {Subscription, SubscriptionPlan} from "../models/associations";
import {getUserIdFromToken} from "../../../utils/user/get_userId";
import Services from "../../Services/models/services";
import {handleError} from "../../../logs/helpers/erroHandler";

/**
 * Fetch the active subscription for a user.
 *
 * @returns {Promise<Subscription | null>} The active subscription or null if not found.
 */
export const getActiveSubscription = async (req: Request): Promise<Subscription | null> => {
    const userId = getUserIdFromToken(req);

    // Find the active subscription for the user
    return await Subscription.findOne({
        where: {
            user_id: userId,
            status: 'active',
        },
        include: [{
            model: SubscriptionPlan,
            as: 'subscriptionPlan',
        }]
    });
};


/**
 * Middleware to check subscription validity and service limits.
 *
 * @function checkServiceLimit
 * @returns {Function} Express middleware function
 */
export const checkServiceLimit = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const subscription = await getActiveSubscription(req);

        // Check if subscription exists
        if (!subscription) {
            res.status(404).json(createResponse(false, 'Subscription not found'));
            return
        }



        // Retrieve the maximum number of services allowed by the current plan
        const maxServicesAllowed = subscription?.subscriptionPlan.service_limit;

        // Count the current number of services for the user
        const currentServicesCount = await Services.count({
            where: {
                provider_id: subscription.user_id
            }
        });

        // Check if the user has reached the limit
        if (currentServicesCount >= maxServicesAllowed) {
            res.status(403).json(createResponse(false, 'You have reached the maximum number of services allowed. Please upgrade your subscription.'));
            return
        }

        // Proceed to the next middleware
        next();
    } catch (error) {
        handleError(error, req, res, 'Error checking service limit and subscription validity');
    }
});
