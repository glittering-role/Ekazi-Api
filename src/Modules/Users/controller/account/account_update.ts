import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { Users, UserDetails , UserLocation } from "../../model/associations";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import {createResponse} from "../../../../logs/helpers/response";
import {validateInput} from "../../../../utils/validation/validation";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {createNotifications} from "../../../Notifications/service/notificationService";
import {formatPhoneNumber} from "../../../../utils/validation/validation.utils";

const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromToken(req);

        // Validate the request input using Joi validation
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

        const { first_name, middle_name, last_name, date_of_birth, gender, about_the_user } = value;

        const userDetails = await UserDetails.findOne({ where: { user_id: userId } });
        if (!userDetails) {
            res.status(404).json(createResponse(false, "User not found"));
            return;
        }

        // Update fields dynamically
        const updatedFields = {
            ...(first_name && { first_name }),
            ...(middle_name !== undefined && { middle_name }),
            ...(last_name && { last_name }),
            ...(date_of_birth && { date_of_birth: new Date(date_of_birth) }),
            ...(gender !== undefined && { gender }),
            ...(about_the_user !== undefined && { about_the_user }),
        };


        await userDetails?.update(updatedFields);

        res.status(200).json(createResponse(true, "Profile updated successfully"));
    } catch (error) {
        handleError(error, req, res, "Failed to update profile");
    }
});

// Add or update phone number functionality
const addOrUpdatePhoneNumber = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromToken(req);
        let { phone_number } = req.body;

        // Format the phone number before validation
        phone_number = formatPhoneNumber(phone_number);

        // Validate phone number input (using the phone validation logic from the schema)
        const phoneValidationResult = validateInput({ phone: phone_number });
        if (phoneValidationResult.errors) {
            res.status(400).json(createResponse(false, "Validation failed", { phoneNumber: phoneValidationResult.errors }));
            return;
        }

        const user = await Users.findByPk(userId);
        if (!user) {
            res.status(404).json(createResponse(false, "User not found"));
            return;
        }

        // Check if the user already has a phone number
        if (user.phone_number) {
            // Update existing phone number
            user.phone_number = phone_number;  // Save the formatted phone number
            await user.save();
            res.status(200).json(createResponse(true, "Phone number updated successfully"));
            return;
        } else {
            // Add new phone number
            user.phone_number = phone_number;  // Save the formatted phone number
            await user.save();
            res.status(200).json(createResponse(true, "Phone number added successfully"));
            return;
        }

    } catch (error) {
        handleError(error, req, res, "Failed to add or update phone number");
    }
});

const checkUsernameAvailability = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.body;

        // Validate the username
        const usernameValidationResult = validateInput({ username });
        if (usernameValidationResult.errors) {
            res.status(400).json(createResponse(false, 'Validation failed', { username: usernameValidationResult.errors }));
            return;
        }

        // Check if the username already exists
        const existingUser = await Users.findOne({ where: { username } });
        if (existingUser) {
            res.status(400).json(createResponse(false, 'This username is already in use'));
            return
        } else {
            res.status(200).json(createResponse(true, 'Username is available'));
            return
        }
    } catch (error) {
        handleError(error, req, res, "Internal Server Error");
    }
});

// Add username functionality
const updateUsername = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromToken(req);
        const { username } = req.body;

        // Validate the username input
        const usernameValidationResult = validateInput({ username });
        if (usernameValidationResult.errors) {
             res.status(400).json(createResponse(false, 'Validation failed', { username: usernameValidationResult.errors }));
            return
        }

        // Fetch the user's details using the userId from the token
        const user = await Users.findOne({ where: { id: userId } });
        if (!user) {
             res.status(404).json(createResponse(false, 'User not found'));
            return
        }

        // Check if the username is already taken by another user
        const existingUser= await Users.findOne({ where: { username } });
        if (existingUser && existingUser.id !== userId) {
             res.status(400).json(createResponse(false, 'This username is already in use'));
            return
        }

        // Check if the new username is the same as the current one
        if (user.username === username) {
             res.status(400).json(createResponse(false, 'The new username is the same as the current username.'));
            return
        }

        // Proceed to update the username
        user.username = username;

        await user.save();

        // Update the username in the UserDetails table
        const notificationMessage = `Your username has been updated to ${username}`;
        await createNotifications(user.id, 'Username Updated Successfully', notificationMessage);

        res.status(200).json(createResponse(true, 'Username updated successfully'));
    } catch (error) {
        handleError(error, req, res, "Internal Server Error");
    }
});

// Remove phone number functionality
const removePhoneNumber = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        // Fetch the current user
        const user = await Users.findByPk(user_id);
        if (!user) {
             res.status(404).json(createResponse(false, 'User not found'));
            return;
        }

        // Check if the user already has a phone number
        if (!user?.phone_number) {
             res.status(400).json(createResponse(false, 'No phone number to remove.'));
            return;
        }

        // Remove the phone number
        user.phone_number = null;

        await user?.save();

        res.status(200).json(createResponse(true, 'Phone number removed successfully'));
    } catch (error) {
        handleError(error, req, res, "Internal Server Error");

    }
});

const updateUserLocation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromToken(req);

        // Validate the request input using Joi validation
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

        const { country, state, state_name, continent, city, zip } = value;

        // Find the user's location or create it if it doesn't exist
        let userLocation: UserLocation | null = await UserLocation.findOne({ where: { user_id: userId } });

        if (!userLocation) {
            userLocation = await UserLocation.create({ user_id: userId });
        }

        // Update fields dynamically, ensuring that undefined values are excluded
        const updatedFields: Partial<UserLocation> = {
            ...(country && { country }),
            ...(state && { state }),
            ...(state_name && { state_name }),
            ...(continent && { continent }),
            ...(city && { city }),
            ...(zip && { zip }),
        };

        // Ensure only valid fields are passed to update
        await userLocation.update(updatedFields);

        res.status(200).json(createResponse(true, "Location updated successfully"));
    } catch (error) {
        handleError(error, req, res, "Failed to update location");
    }
});

export {
    updateProfile,
    addOrUpdatePhoneNumber,
    checkUsernameAvailability,
    updateUsername,
    removePhoneNumber,
    updateUserLocation
};
