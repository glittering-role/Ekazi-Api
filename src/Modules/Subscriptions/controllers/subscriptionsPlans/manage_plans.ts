import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { validateInput } from "../../../../utils/validation/validation";
import { createResponse } from "../../../../logs/helpers/response";
import {SubscriptionPlan} from "../../models/associations";

// Fetch all subscription plans with pagination
const getAllSubscriptionPlans = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        // Fetch only necessary fields
        const subscriptionPlans = await SubscriptionPlan.findAll({
            attributes: ['id', 'name', 'description', 'price', 'billing_cycle', 'service_limit', 'features', 'trial_period', 'discount', 'is_active', 'is_free', 'priority_support'],
            where: { is_active: true },
        });

        res.status(200).json(createResponse(true, 'Subscription plans fetched successfully', {
            plans: subscriptionPlans
        }));

    } catch (error) {
        handleError(error, req, res, 'Error fetching subscription plans');
    }
});


// Fetch a specific subscription plan by ID
const getSubscriptionPlanById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            res.status(404).json(createResponse(false, 'Subscription plan not found'));
            return
        }

        res.status(200).json(createResponse(true, 'Subscription plan retrieved successfully', { plan } ));
    } catch (error) {
        handleError(error, req, res, 'Error fetching subscription plan by ID');
    }
});

// Update an existing subscription plan by ID
const updateSubscriptionPlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { value, errors } = validateInput(req.body);
        if (errors) {
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        if (!value) {
            res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
            return;
        }

        const { name, description, price, billing_cycle, service_limit, features, trial_period, discount, priority_support } = value;


        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            res.status(404).json(createResponse(false, 'Subscription plan not found'));
            return
        }

        // Calculate discounted price
        const discountAmount: number = discount
            ? parseFloat(String(price)) * (parseFloat(String(discount)) / 100)
            : 0;

        const finalPrice: number = discountAmount
            ? parseFloat(String(price)) - discountAmount
            : parseFloat(String(price));


        // Update plan
        await plan.update({
            name,
            description,
            price: finalPrice,
            billing_cycle,
            service_limit,
            features,
            trial_period,
            discount,
            priority_support
        });

        res.status(200).json(createResponse(true, 'Subscription plan updated successfully', {plan}));
    } catch (error) {
        handleError(error, req, res, 'Error updating subscription plan');
    }
});

// Toggle the active status of a subscription plan by ID
const toggleSubscriptionPlanStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;  // Get plan ID from the URL

        // Find the subscription plan by ID
        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            res.status(404).json(createResponse(false, 'Subscription plan not found'));
            return;
        }

        // Toggle the is_active status (if it's active, set to inactive and vice versa)
        plan.is_active = !plan.is_active;

        // Save the changes
        await plan.save();

        // Respond with the updated subscription plan status
        const message = plan.is_active ? 'Subscription plan activated successfully' : 'Subscription plan deactivated successfully';
        res.status(200).json(createResponse(true, message ));

    } catch (error) {
        // Handle the error and send response
        handleError(error, req, res, 'Error toggling subscription plan status');
    }
});


// Delete a subscription plan by ID
const deleteSubscriptionPlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByPk(id);

        if (!plan) {
            res.status(404).json(createResponse(false, 'Subscription plan not found'));
            return
        }

        await plan.destroy();

        res.status(200).json(createResponse(true, 'Subscription plan deleted successfully'));

    } catch (error) {
        handleError(error, req, res, 'Error deleting subscription plan');
    }
});

export {
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    updateSubscriptionPlan,
    toggleSubscriptionPlanStatus,
    deleteSubscriptionPlan
};