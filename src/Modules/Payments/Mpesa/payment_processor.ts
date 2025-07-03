import axios from 'axios';
import { handleError } from "../../../logs/helpers/erroHandler";
import { createResponse } from "../../../logs/helpers/response";
import { MpesaStkRequest } from "../models/associations";
import { asyncHandler } from "../../../middleware/async-middleware";
import { Request, Response } from "express";
import logger from "../../../logs/helpers/logger";
import { paymentEventEmitter } from '../../../events/eventEmitter';

require('dotenv').config();

// Interface for function parameters
interface STKPushParams {
    amount: number | null ;
    phone: string ;
    Order_ID: string;
    accessToken: string ;
}

// Assuming the structure of CallbackMetadata.Item is an array of objects with Name and Value fields
interface MetadataItem {
    Name: string;
    Value: string;
}

const initiateSTKPush = async ({ amount, phone, Order_ID, accessToken }: STKPushParams): Promise<any> => {
    try {
        const auth = `Bearer ${accessToken}`;
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const shortCode = process.env.BUSINESS_SHORT_CODE as string;
        const passKey = process.env.PASS_KEY as string;
        const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');
        const callbackUrl = `${process.env.CALLBACK_URL}/${Order_ID}`;

        const payload = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phone,
            PartyB: shortCode,
            PhoneNumber: phone,
            CallBackURL: callbackUrl,
            AccountReference: 'Ekazi Online',
            TransactionDesc: 'Paid online'
        };

        const response = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                Authorization: auth,
                'Content-Type': 'application/json',
            }
        });

        await MpesaStkRequest.create({
            phone,
            amount,
            reference: 'Ekazi Jobs',
            description: 'Paid online',
            businessShortCode: shortCode,
            checkoutRequestID: response.data.CheckoutRequestID,
            status: 'initiated',
        });

        return response.data;

    } catch (error: any) {
        logger.error(`Failed to initiate STK push ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });

        return { success: false, error: 'Failed to initiate STK push' };
    }
};

// STK Push Callback handler
const stkPushCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { Order_ID } = req.params;
        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = req.body.Body.stkCallback;

        if (ResultCode === 1032) {
            // Update status as canceled
            await MpesaStkRequest.update({ status: 'canceled' }, { where: { checkoutRequestID: CheckoutRequestID } as any });
            res.status(200).json(createResponse(false, 'Request canceled by user'));
            return;
        }

        if (ResultCode === 0) {
            // Payment was successful, now process the CallbackMetadata
            const meta = Object.values(CallbackMetadata.Item) as MetadataItem[];  // Cast the result to MetadataItem[]

            const PhoneNumber = meta.find((o) => o.Name === 'PhoneNumber')?.Value?.toString() ?? '';
            const Amount = parseFloat(meta.find((o) => o.Name === 'Amount')?.Value ?? '');
            const MpesaReceiptNumber = meta.find((o) => o.Name === 'MpesaReceiptNumber')?.Value?.toString() ?? '';
            const TransactionDate = meta.find((o) => o.Name === 'TransactionDate')?.Value?.toString() ?? '';

            if (!PhoneNumber || !Amount || !MpesaReceiptNumber || !TransactionDate) {
                throw new Error('Required fields are missing in CallbackMetadata');
            }

            // Ensure CheckoutRequestID is valid before updating
            if (!CheckoutRequestID) {
                throw new Error('CheckoutRequestID is required for updating MpesaStkRequest');
            }

            // Update MpesaStkRequest table
            await MpesaStkRequest.update({
                status: 'paid',
                phone: PhoneNumber,
                amount: Amount,
                receiptNumber: MpesaReceiptNumber,
                description: 'Paid online',
                resultDesc: ResultDesc,
                transactionDate: TransactionDate
            }, { where: { checkoutRequestID: CheckoutRequestID } as any });

            // Emit a payment success event
            paymentEventEmitter.emit('paymentSuccess', {
                Order_ID,
                PhoneNumber,
                Amount,
                MpesaReceiptNumber,
                TransactionDate
            });

            res.status(200).json(createResponse(true, 'Payment processed successfully'));
            return;
        }

        // Handle payment failure
        await MpesaStkRequest.update({ status: 'failed' }, { where: { checkoutRequestID: CheckoutRequestID } as any });

        // Emit a payment failure event
        paymentEventEmitter.emit('paymentFailure', {
            Order_ID,
            ResultCode,
            ResultDesc
        });

        res.status(500).json(createResponse(false, `Request failed with ResultCode: ${ResultCode}`));
        return;

    } catch (error: any) {
        handleError(error, req, res, 'Something went wrong with the callback');
    }
});

// const stkPushCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { Order_ID } = req.params;
//         const { MerchantRequestID, CheckoutRequestID , ResultCode, ResultDesc, CallbackMetadata } = req.body.Body.stkCallback;
//
//         if (ResultCode === 1032) {
//             // Update status as canceled
//             await MpesaStkRequest.update({ status: 'canceled' }, { where: { checkoutRequestID: CheckoutRequestID } as any } );
//             res.status(200).json(createResponse(false, 'Request canceled by user'));
//             return;
//         }
//
//         if (ResultCode === 0) {
//             // Payment was successful, now process the CallbackMetadata
//             const meta = Object.values(CallbackMetadata.Item) as MetadataItem[];  // Cast the result to MetadataItem[]
//
//             const PhoneNumber = meta.find((o) => o.Name === 'PhoneNumber')?.Value?.toString() ?? '';
//             const Amount = parseFloat(meta.find((o) => o.Name === 'Amount')?.Value ?? '');
//             const MpesaReceiptNumber = meta.find((o) => o.Name === 'MpesaReceiptNumber')?.Value?.toString() ?? '';
//             const TransactionDate = meta.find((o) => o.Name === 'TransactionDate')?.Value?.toString() ?? '';
//
//             if (!PhoneNumber || !Amount || !MpesaReceiptNumber || !TransactionDate) {
//                 throw new Error('Required fields are missing in CallbackMetadata');
//             }
//
//             // Ensure CheckoutRequestID is valid before updating
//             if (!CheckoutRequestID) {
//                 throw new Error('CheckoutRequestID is required for updating MpesaStkRequest');
//             }
//             // Update MpesaStkRequest table
//             await MpesaStkRequest.update({
//                 status: 'paid',
//                 phone: PhoneNumber,
//                 amount: Amount,
//                 receiptNumber: MpesaReceiptNumber,
//                 description: 'Paid online',
//                 resultDesc: ResultDesc,
//                 transactionDate: TransactionDate
//             }, { where: { checkoutRequestID: CheckoutRequestID } as any });
//
//             // Create SubscriptionPayment entry after payment confirmation
//             const subscription = await Subscription.findOne({ where: { id: Order_ID } });
//
//             if (subscription) {
//                 await SubscriptionPayment.create({
//                     subscription_id: subscription.id,
//                     user_id: subscription.user_id,
//                     amount: Amount,
//                     phone: PhoneNumber,
//                     payment_date: moment().toDate(),
//                     payment_method: 'Mobile Money',
//                     status: 'completed',
//                     transaction_id: MpesaReceiptNumber
//                 });
//
//                 // Update subscription status to 'active'
//                 await subscription.update({ status: 'active' });
//
//             } else {
//                 handleError("Payment processing failed", req, res, 'Payment processing failed');
//             }
//
//              res.status(200).json(createResponse(true, 'Payment processed successfully'));
//             return
//         }
//
//         // Handle payment failure
//         await MpesaStkRequest.update({ status: 'failed' }, { where: { checkoutRequestID: CheckoutRequestID } as any });
//
//         handleError(`Request failed with ResultCode: ${ResultCode}`, req, res, `Description: ${ResultDesc}`);
//
//          res.status(500).json(createResponse(false, `Request failed with ResultCode: ${ResultCode}`));
//         return
//
//     } catch (error: any) {
//         handleError(error, req, res, 'Something went wrong with the callback');
//     }
// });

export {
    initiateSTKPush,
    stkPushCallback
};
