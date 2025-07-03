import {stkPushCallback} from "../../../Mpesa/payment_processor";
import express from 'express';

const MpesaPaymentRouters = express.Router();

MpesaPaymentRouters.post('/stkPushCallback/:Order_ID' , stkPushCallback);

export default MpesaPaymentRouters;