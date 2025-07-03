import logger from "../../../../logs/helpers/logger";
import {MpesaStkRequest} from "../../../Payments/models/associations";
require('dotenv').config();


// Function to check payment status
export const checkPaymentStatus = async (checkoutRequestID: any) => {
    try {

        const paymentRequest = await MpesaStkRequest.findOne({ where: { checkoutRequestID } });

        if (paymentRequest) {

            if (paymentRequest.status === 'paid') {

                return { success: true, data: 'Payments Completed Successfully' };

            } else if (paymentRequest.status === 'canceled') {

                return { success: false, message: 'Payments was canceled' };

            } else if (paymentRequest.status === 'failed') {

                return { success: false, message: 'Payments was Failed' };

            } else {

                return { success: false, message: 'Payments status is not paid or canceled' };
            }
        } else {
            return { success: false, message: 'Payments request not found in the database' };
        }

    } catch (error : any) {
        logger.error(`Error extracting user ID: ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });

    }
};

