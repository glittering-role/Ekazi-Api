import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { validateInput } from "../../../../utils/validation/validation";
import moment from "moment";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { createResponse } from "../../../../logs/helpers/response";
import {Subscription, SubscriptionPayment, SubscriptionPlan} from "../../models/associations";
import { checkPaymentStatus } from "./check_payment_status";
import { initiateSTKPush } from "../../../Payments/Mpesa/payment_processor";
import {paymentEventEmitter} from "../../../../events/eventEmitter";
import {createNotifications} from "../../../Notifications/service/notificationService";

// Extend Request Type to Include Mpesa Token
interface CustomRequest extends Request {
    safaricom_access_token?: string;
}

// Delay Function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


export const createSubscription = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
        try {
            const userId = getUserIdFromToken(req);

            if (!req.safaricom_access_token) {
                res.status(401).json(createResponse(false, "Mpesa access token is missing"));
                return;
            }
            const mpesaToken = req.safaricom_access_token;

            // Validate input
            const { value, errors } = validateInput(req.body);
            if (errors) {
                res.status(400).json(createResponse(false, "Validation failed", { errors }));
                return;
            }

            if (!value) {
                res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
                return;
            }

            const { phone, auto_renew, plan_id } = value;

            // Fetch the subscription plan
            const plan = await SubscriptionPlan.findByPk(plan_id);

            if (!plan || !plan.is_active) {
                res.status(404).json(createResponse(false, "Subscription plan not found or inactive"));
                return;
            }

            // Round the price to the nearest whole number
            const roundedPrice = plan.price != null ? Math.round(plan.price) : 0;

            // Set start_date to the current date
            const start_date = moment().toDate();

            // Calculate end_date based on billing cycle
            let end_date;
            switch (plan.billing_cycle) {
                case "monthly":
                    end_date = moment(start_date).add(1, "month").toDate();
                    break;
                case "yearly":
                    end_date = moment(start_date).add(1, "year").toDate();
                    break;
                default:
                    res.status(400).json(createResponse(false, "Invalid billing cycle"));
                    return;
            }

            // Create new subscription
            const newSubscription = await Subscription.create({
                user_id: userId,
                plan_id,
                start_date,
                end_date,
                status: "in_progress",
                auto_renew,
            });

            // Initiate the STK Push
            const stkResponse = await initiateSTKPush({
                amount: roundedPrice,
                phone,
                Order_ID: newSubscription.id,
                accessToken: mpesaToken,
            });

            if (stkResponse?.CheckoutRequestID) {
                // Listen for payment success event
                paymentEventEmitter.once('paymentSuccess', async (paymentData: { Order_ID: string; Amount: any; PhoneNumber: any; MpesaReceiptNumber: any; }) => {
                    if (paymentData.Order_ID === newSubscription.id) {
                        // Create SubscriptionPayment entry after payment confirmation
                        await SubscriptionPayment.create({
                            subscription_id: newSubscription.id,
                            user_id: userId,
                            amount: paymentData.Amount,
                            phone: paymentData.PhoneNumber,
                            payment_date: moment().toDate(),
                            payment_method: 'Mobile Money',
                            status: 'completed',
                            transaction_id: paymentData.MpesaReceiptNumber
                        });

                        // Update subscription status to 'active'
                        await newSubscription.update({ status: 'active' });

                        // Send response to client
                        res.status(200).json(createResponse(true, 'Payment processed successfully and subscription activated'));
                    }
                });

                // Listen for payment failure event
                paymentEventEmitter.once('paymentFailure', async (paymentData: { Order_ID: string; ResultCode: any; }) => {
                    if (paymentData.Order_ID === newSubscription.id) {
                        // Update subscription status to 'failed'
                        await newSubscription.update({ status: 'failed' });

                        // Send response to client
                        res.status(500).json(createResponse(false, `Payment failed with ResultCode: ${paymentData.ResultCode}`));
                    }
                });

                // Delay for 20 seconds before checking payment status
                await delay(20000);

                // Check payment status
                const paymentStatus = await checkPaymentStatus(stkResponse.CheckoutRequestID);

                if (paymentStatus?.success) {
                    res.status(200).json(
                        createResponse(true, "STK Push initiated successfully and payment status checked", {
                            data: paymentStatus?.data,
                        })
                    );
                    return;
                } else {
                    res.status(500).json(
                        createResponse(false, "STK Push initiated but failed to check payment status", {
                            message: paymentStatus?.message,
                        })
                    );
                    return;
                }
            }

            // Notify the user about the new queue entry
            const notificationMessage = `A new subscription has been created for you. Subscription ID: ${newSubscription.id}`;
            await createNotifications(userId, 'Subscription Created', notificationMessage );

            res.status(500).json(createResponse(false, "Failed to initiate STK Push"));
            return;
        } catch (error) {
            handleError(error, req, res, "An error occurred while creating the subscription");
        }
    }
);