import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { Users, AccountToDelete } from '../../model/associations';
import bcrypt from 'bcrypt';
import { validateInput  } from "../../../../utils/validation/validation";
import { createResponse } from "../../../../logs/helpers/response";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {createNotifications} from "../../../Notifications/service/notificationService";

const deleteAccount = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let user_id;

  try {
    user_id = getUserIdFromToken(req);

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

    const { current_password } = value;

    const user = await Users.findByPk(user_id);
    if (!user) {
      res.status(404).json(createResponse(false, 'User not found'));
      return;
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      res.status(400).json(createResponse(false, 'Current password is incorrect.'));
      return;
    }

    // Update `status` and `isActive` before soft deleting
    user.status = 'deleted';
    user.isActive = false;
    await user.save();

    // Soft delete user using Sequelize's `destroy` method with paranoid mode
    await user.destroy();

    // Set a 30-day deletion period
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    await AccountToDelete.create({
      user_id: user.id,
      deletion_date: deletionDate
    });

    res.status(200).json(createResponse(true, 'Account marked for deletion. It will be permanently deleted after 30 days.'));
    return;
  } catch (error) {
    handleError(error, req, res, "An error occurred while deleting the account.");
  }
});


const updateEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let user_id;

  try {
    user_id = getUserIdFromToken(req);

    // Validate email
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

    const { email: newEmail } = value;

    const user = await Users.findByPk(user_id);
    if (!user) {
       res.status(404).json(createResponse(false, 'User not found'));
      return
    }

    const existingUser = await Users.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== user_id) {
       res.status(400).json(createResponse(false, 'This email is already in use by another account.'));
      return
    }

    if (user.email === newEmail) {
       res.status(400).json(createResponse(false, 'The new email is the same as the current email.'));
      return
    }

    user.email = newEmail;
    await user.save();

    // Notify the user about the new queue entry
    const notificationMessage = `Your email has been updated to ${newEmail}.`;
    await createNotifications(user.id, 'Email updated successfully', notificationMessage);

    res.status(200).json(createResponse(true, 'Email updated successfully'));
  } catch (error) {
    handleError(error, req, res, "An error occurred while updating email for ID");
  }
});

const updatePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let user_id;

  try {
    user_id = getUserIdFromToken(req);

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

    const { current_password , new_password } = value;

    const user = await Users.findByPk(user_id);

    if (!user) {
       res.status(404).json(createResponse(false, 'User not found'));
      return
    }

    if (!user.password) {
       res.status(500).json(createResponse(false, 'User password not found in the database.'));
      return
    }

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
       res.status(400).json(createResponse(false, 'Current password is incorrect.'));
      return
    }

    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
       res.status(400).json(createResponse(false, 'The new password cannot be the same as the current password.'));
      return
    }

    user.password = await bcrypt.hash(new_password, 10);
    await user.save();

    // Notify the user about the new queue entry
    const notificationMessage = `Your password has been updated successfully.`;
    await createNotifications(user.id, 'Password update successfully', notificationMessage);

    res.status(200).json(createResponse(true, 'Password updated successfully'));
    return
  } catch (error) {
    handleError(error, req, res, "Error while updating password.");
  }
});


export {
  updateEmail,
  updatePassword,
  deleteAccount,
};
