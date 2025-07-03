import {Users, PasswordResetToken} from '../model/associations';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {asyncHandler} from "../../../middleware/async-middleware";
import {Request, Response} from "express";
import {createResponse} from "../../../logs/helpers/response";
import {validateInput} from "../../../utils/validation/validation";
import {sendPasswordResetEmail} from "../../../services/mail/passwordResetEmail";
import {handleError} from "../../../logs/helpers/erroHandler";


// Define a function to handle the "forgot password" request
const forgotPassword  = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate the request input
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

    const { email: email  } = value;

    // Find a user with the provided email address
    const user = await Users.findOne({ where: { email } });

    if (!user) {
       res.status(401).json(createResponse(false, 'Email does not exist'));
      return
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(4).toString('hex');
    await PasswordResetToken.create({
      email,
      password_reset_token: resetToken,
      expires_at: new Date(Date.now() + 3600000),
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json(createResponse(true, 'Password reset link sent to email'));
  } catch (error) {
    handleError(error, req, res, "Internal Server Error");
  }
});

// Define a function to handle the "reset password" request
const resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  // Validate the request input
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

  const { password } = value;

  try {
    // Find the password reset token record
    const resetTokenRecord = await PasswordResetToken.findOne({ where: { password_reset_token: token } });

    if (!resetTokenRecord || resetTokenRecord.expires_at < new Date()) {
      res.status(400).json(createResponse(false, 'Invalid or expired token'));
      return;
    }

    // Find the user associated with the token
    const user = await Users.findOne({ where: { email: resetTokenRecord.email } });

    if (!user) {
      res.status(404).json(createResponse(false, 'User not found'));
      return;
    }

    // Encrypt the new password and update the user's password in the database
    const encryptedPassword = await bcrypt.hash(password, 10);

    await Users.update({ password: encryptedPassword }, { where: { email: user.email } });

    // Delete all password reset tokens associated with the user's email
    await PasswordResetToken.destroy({ where: { email: user.email } });

    res.status(200).json(createResponse(true, 'Password updated successfully'));
  } catch (error) {
    // Log error if any exception occurs
    handleError(error, req, res, "Internal Server Error");
  }
});


// Export the functions for the routes
export {
  forgotPassword,
  resetPassword,
};
