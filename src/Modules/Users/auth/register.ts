import { asyncHandler } from "../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../logs/helpers/erroHandler";
import { Users, UserDetails, UserLocation } from "../model/associations";
import bcrypt from 'bcrypt';
import generateIdenticon from '../jobs/avatarService';
import { createResponse } from "../../../logs/helpers/response";
import { validateInput } from "../../../utils/validation/validation";
import { verifyHcaptcha } from "./hCupture";
import generateCoverPhoto from "../jobs/generateCoverPhoto";
import { assignUserRole } from "../../../Modules/Users/authorization/helpers/roleHelpers";
import db from "../../../config/db"; 
import { Transaction } from "sequelize";

const generateUniqueUsername = async (email: string) => {
  let baseUsername = email.split('@')[0];
  let username = baseUsername;
  let counter = 1;

  // Check if the username is unique
  while (await Users.findOne({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  return username;
};

export const RegisterUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    const { hcaptchaResponse } = req.body;

    // Validate the request input
    const { value, errors } = validateInput(req.body);
    if (errors) {
      res.status(400).json(createResponse(false, "Validation failed", { errors }));
      return;
    }
    if (!value) {
      res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
      return;
    }

    const { password, email } = value;

    // Check if email is already registered
    const isEmailRegistered = await Users.findOne({ where: { email } });
    if (isEmailRegistered) {
      res.status(409).json(createResponse(false, 'Email already registered'));
      return;
    }

    // Verify Hcaptcha
    try {
      await verifyHcaptcha({ hcaptchaResponse });
    } catch (hcaptchaError) {
      res.status(400).json(createResponse(false, 'Hcaptcha verification failed'));
      return;
    }

    // Generate hashed password, avatar URL, cover photo, and unique username
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarUrl = await generateIdenticon(email);
    const coverImageUrl = await generateCoverPhoto();
    const username = await generateUniqueUsername(email);

    // Start a transaction for the DB operations
    transaction = await db.transaction();

    // Create user
    const user = await Users.create({
      email,
      username,
      authType: 'system',
      status: 'active',
      isActive: true,
      isEmailVerified: false,
      password: hashedPassword,
    }, { transaction });

    // Create user details
    await UserDetails.create({
      first_name: "",
      last_name: "",
      user_id: user.id,
      image: avatarUrl,
    }, { transaction });

    // Ensure user location exists
    const userLocation = await UserLocation.findOne({
      where: { user_id: user.id },
      transaction
    });
    if (!userLocation) {
      await UserLocation.create({
        user_id: user.id,
        city: req.body.location || null,
      }, { transaction });
    }

    // Assign role dynamically (e.g., 'user')
    const assignedRole = 'user'; 
    const roleAssigned = await assignUserRole(user.id, assignedRole, transaction);
    if (!roleAssigned) {
      await transaction.rollback();
      res.status(400).json(createResponse(false, 'Role assignment failed'));
      return;
    }

    // Commit the transaction if everything succeeded
    await transaction.commit();

    res.json(createResponse(true, 'User created successfully'));
  } catch (error) {
    if (transaction) await transaction.rollback();
    handleError(error, req, res, "An error occurred while registering the user");
  }
});
