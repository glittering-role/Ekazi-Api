import {asyncHandler} from "../../../../middleware/async-middleware";
import {Request, Response} from "express";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {validateInput} from "../../../../utils/validation/validation";
import {createResponse} from "../../../../logs/helpers/response";
import {SubscriptionPlan} from "../../models/associations";


// Create a new subscription plan
const createSubscriptionPlan  = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {

        const { value, errors } = validateInput(req.body);
        if (errors) {
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        // Ensure value is defined
        if (!value) {
            res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
            return;
        }

        const { name, description, price, billing_cycle, service_limit, features, trial_period, discount, priority_support } = value;


        // Calculate discounted price
        const discountAmount: number = discount
            ? parseFloat(String(price)) * (parseFloat(String(discount)) / 100)
            : 0;

        // Calculate final price
        const finalPrice: number = discountAmount
            ? parseFloat(String(price)) - discountAmount // Calculate final price as a number
            : parseFloat(String(price)); // No discount, just use the original price


        // Update price with discounted price
        await SubscriptionPlan.create({
            name,
            description,
            price: finalPrice,
            billing_cycle,
            service_limit,
            features,
            trial_period,
            discount,
            is_active: true,
            is_free: false,
            priority_support
        });

        res.status(201).json(createResponse(true, 'Subscription plan created successfully'));
    } catch (error) {
        handleError(error, req, res, 'Error creating subscription plan');
    }
});



export { createSubscriptionPlan };