import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../../../middleware/async-middleware";
import { handleError } from "../../../logs/helpers/erroHandler";
import { createResponse } from "../../../logs/helpers/response";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let cachedToken: string | null = null;
let tokenExpirationTime: Date | null = null;

export const mpesaAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (cachedToken && tokenExpirationTime && new Date() < tokenExpirationTime) {
        (req as any).safaricom_access_token = cachedToken;
        return next();
    }

    try {

        const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
        const auth = Buffer.from(`${process.env.SAFARICOM_CONSUMER_KEY}:${process.env.SAFARICOM_CONSUMER_SECRET}`).toString("base64");

        const response = await axios.get(url, {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        const { access_token, expires_in } = response.data;
        cachedToken = access_token;
        tokenExpirationTime = new Date(Date.now() + expires_in * 1000);
        (req as any).safaricom_access_token = access_token;

        next();
    } catch (error: any) {
        handleError(error, req, res, "Something went wrong when trying to process your payment");
    }
});
