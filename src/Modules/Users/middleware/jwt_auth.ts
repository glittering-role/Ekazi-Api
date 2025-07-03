import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../../../logs/helpers/response';
import logger from '../../../logs/helpers/logger';
import {IUser} from "../../../types/interfaces/schema/interfaces.schema";
import { Socket } from 'socket.io';

dotenv.config();

// Constants
const MAX_ALLOWED_FAILED_ATTEMPTS = 200;
const SUSPENSION_TIME_IN_HOURS = 1;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

// Type definition for the failed attempts store
interface FailedAttemptsStore {
    [key: string]: {
        attempts: number;
        suspendedUntil: number | null;
    };
}

const failedAttemptsStore: FailedAttemptsStore = {};


const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const ipAddress =
        req.app.get('trust proxy')
            ? req.headers['x-forwarded-for']?.toString().split(',')[0] || req.ip || 'unknown-ip'
            : req.ip || 'unknown-ip';

    if (!failedAttemptsStore[ipAddress]) {
        failedAttemptsStore[ipAddress] = { attempts: 0, suspendedUntil: null };
    }

    const { suspendedUntil, attempts } = failedAttemptsStore[ipAddress];

    if (suspendedUntil && Date.now() < suspendedUntil) {
         res.status(403).json(createResponse(false, 'Too many failed attempts. Your IP is temporarily suspended.'));
         return
    }

    const token = req.cookies['x_TKN']; 
    
    if (!token) {
        failedAttemptsStore[ipAddress].attempts++;
         res.status(401).json(createResponse(false, 'Session Expired Login.'));
         return
    }

    try {
        let decodedToken: JwtPayload & IUser;
        decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload & IUser;
        req.user = decodedToken;

        failedAttemptsStore[ipAddress] = { attempts: 0, suspendedUntil: null };

        return next();
    } catch (error: any) {
        logger.error(`Token verification failed - ${error.message}`, {
            metadata: {
                timestamp: new Date().toISOString(),
                error: error.message,
                stack: error.stack,
            },
        });

        failedAttemptsStore[ipAddress].attempts++;

        if (failedAttemptsStore[ipAddress].attempts >= MAX_ALLOWED_FAILED_ATTEMPTS) {
            failedAttemptsStore[ipAddress].suspendedUntil =
                Date.now() + SUSPENSION_TIME_IN_HOURS * 60 * 60 * 1000;
             res.status(403).json(createResponse(false, 'Too many failed attempts. Your IP is suspended for 1 hour.'));
             return
        }

         res.status(401).json(createResponse(false, 'Invalid-or-expired-token'));
         return
    }
};

const verifySocketToken = (socket: Socket, next: (err?: Error) => void): void => {
    // Access the req object from the handshake
    const req = socket.request as Request;

    // Access the cookie header from the request (it contains all cookies in a single string)
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
        return next(new Error('Unauthorized: No cookies provided'));
    }

    // Manually find the token in the cookie string
    const tokenMatch = cookieHeader.match(/x_TKN=([^;]+)/);

    if (!tokenMatch) {
        return next(new Error('Unauthorized: No token provided'));
    }

    const token = tokenMatch[1]; // Extract the token from the matched group

    try {
        // Verify the token using JWT
        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload & IUser;
        socket.data.user = decodedToken; // Attach the decoded user to the socket
        next(); // Proceed with the connection
    } catch (error: any) {
        next(new Error(`Unauthorized: ${error.message}`));
    }
}


// Helper to issue access tokens with expiration time directly set
const issueAccessToken = (userId: { id: string }, expiresIn: string): string => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn });
};

export { verifyToken, issueAccessToken ,verifySocketToken };