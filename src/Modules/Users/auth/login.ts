import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../../../logs/helpers/response';
import logger from '../../../logs/helpers/logger';
import { IUser } from '../../../types/interfaces/schema/interfaces.schema';
import { Users, UserDetails, Roles, AccountToDelete } from '../model/associations';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../../../middleware/async-middleware';
import { verifyHcaptcha } from './hCupture';
import { validateInput } from '../../../utils/validation/validation';
import reloadUserWithDetails from '../utils/userUtils';
import { handleError } from '../../../logs/helpers/erroHandler';
import {issueAccessToken} from "../middleware/jwt_auth";

dotenv.config();

// Constants
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { emailOrPhone, hcaptchaResponse, rememberMe } = req.body;

    // Validate input
    const { value, errors } = validateInput(req.body);

    try {
        logger.info(`Login attempt for ${emailOrPhone}`, {
            metadata: {
                identifier: emailOrPhone,
                route: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString(),
            },
        });

        if (errors) {
            res.status(400).json(createResponse(false, 'Validation failed', { errors }));
            return;
        }

        if (!value) {
            res.status(400).json(createResponse(false, 'Validation failed', { errors: ['Invalid input data'] }));
            return;
        }

        // Use a different name for destructuring `value`
        const { emailOrPhone: inputEmailOrPhone, password, rememberMe: rememberMeValue } = value;

        const user = await Users.findOne({
            where: {
                [Op.or]: [{ phone_number: inputEmailOrPhone }, { email: inputEmailOrPhone }],
            },
            include: [
                {
                    model: UserDetails,
                    as: 'user_detail',
                    attributes: ['first_name', 'middle_name', 'last_name', 'image'],
                },
                {
                    model: Roles,
                    as: 'Roles',
                    attributes: ['id', 'role_name'],
                    through: { attributes: [] },
                },
            ],
        });

        if (!user) {
            res.status(404).json(createResponse(false, 'User not found'));
            return;
        }

        if (user.status === 'deleted') {
            user.status = 'active';
            user.isActive = true;

            await AccountToDelete.destroy({ where: { user_id: user.id } });
            await user.save();
        }

        if (!user.isActive) {
            res.status(403).json(createResponse(false, 'Your account is inactive'));
            return;
        }

        if (user.authType !== 'system') {
            res.status(403).json(createResponse(false, 'Contact support'));
            return;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(401).json(createResponse(false, 'Invalid credentials'));
            return;
        }

        // Verify Hcaptcha
        try {
            await verifyHcaptcha({ hcaptchaResponse });
        } catch (hcaptchaError: any) {
            res.status(400).json(createResponse(false, 'Hcaptcha verification failed'));
            return;
        }

        const expirationTime = rememberMeValue ? '30d' : '14d';

        // Clear old token
        res.clearCookie('x_TKN', {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        // Issue new token
        const tokenData = { id: user.id };
        const x_TKN = issueAccessToken(tokenData, expirationTime);

        res.cookie('x_TKN', x_TKN, {
            httpOnly: true,
            maxAge: rememberMeValue ? 14 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        const dataForState = await reloadUserWithDetails(user);

        res.status(200).json(createResponse(true, 'Login successful', { dataForState }));
    } catch (error) {
        handleError(error, req, res, 'Error while logging in.');
    }
});

