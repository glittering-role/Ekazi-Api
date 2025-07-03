import { asyncHandler } from "../../../middleware/async-middleware";
import { Request, Response } from "express";
import { handleError } from "../../../logs/helpers/erroHandler";
import { Users, EmailVerification, UserDetails, Roles } from "../model/associations";
import { v4 as uuidv4 } from "uuid"; // Corrected the import for UUID
import moment from "moment";
import { createResponse } from "../../../logs/helpers/response";
import { getUserIdFromToken } from "../../../utils/user/get_userId";
import { sendEmailVerificationToUser } from "../../../services/mail/sendEmailVerification";
import reloadUserWithDetails from "../utils/userUtils";
import {createNotifications} from "../../Notifications/service/notificationService";

// Send a verification email to the user
const sendVerificationEmailToUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = getUserIdFromToken(req);

  try {
    const user = await Users.findByPk(userId);

    if (!user) {
      res.status(404).json(createResponse(false, "User not found"));
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json(createResponse(false, "Email is already verified"));
      return;
    }

    // Generate a unique registration token
    const registrationToken = uuidv4();

    // Set token expiration time (e.g., 1 hour)
    const tokenExpiresAt = moment().add(1, "hours").toDate();

    // Store the token and expiration date in the database
    await EmailVerification.create({
      email: user.email,
      registration_token: registrationToken,
      token_expires_at: tokenExpiresAt,
    });

    // Send the verification email with the token
    await sendEmailVerificationToUser(user.email, registrationToken);

    res.status(200).json(createResponse(true, "Verification email sent successfully"));
  } catch (error) {
    handleError(error, req, res, "Error while sending verification email.");
  }
});

// Verify the email using the token
const verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  try {
    // Ensure token is a string
    if (typeof token !== "string") {
      res.status(400).json(createResponse(false, "Invalid token format"));
      return;
    }

    // Find the verification record by token
    const verificationRecord = await EmailVerification.findOne({
      where: { registration_token: token },
    });

    if (!verificationRecord) {
      res.status(400).json(createResponse(false, "Invalid or expired token"));
      return;
    }

    // Check if the token is expired
    if (moment().isAfter(verificationRecord.token_expires_at)) {
      res.status(400).json(createResponse(false, "Token has expired"));
      return;
    }

    // Fetch the user associated with the email
    const user = await Users.findOne({
      where: { email: verificationRecord.email },
      include: [
        {
          model: UserDetails,
          as: "user_detail",
          attributes: ["image"],
        },
        {
          model: Roles,
          as: "Roles",
          attributes: ["id", "role_name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user) {
      res.status(404).json(createResponse(false, "User not found"));
      return;
    }

    // Update the user's email verification status
    user.isEmailVerified = true;
    user.isActive = true;

    await user.save();

    const dataForState = await reloadUserWithDetails(user);

    // Notify the user about the new queue entry
    const notificationMessage = `Your email has been verified.`;
    await createNotifications(user.id, 'email', notificationMessage);

    res.status(200).json(createResponse(true, "Email verified successfully", { dataForState }));
  } catch (error) {
    handleError(error, req, res, "Error while verifying email.");
  }
});

// Export the functions for the routes
export { sendVerificationEmailToUser, verifyEmail };
