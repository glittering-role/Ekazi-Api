import { Request, Response } from 'express';
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import { ServiceProviders, VerificationDocuments } from "../../models/associations";
import { createResponse } from "../../../../logs/helpers/response";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { Roles, UserDetails, Users } from "../../../Users/model/associations";
import { validateInput } from "../../../../utils/validation/validation";
import { createNotifications } from "../../../Notifications/service/notificationService";
import { asyncHandler } from "../../../../middleware/async-middleware";
import reloadUserWithDetails from '../../../../Modules/Users/utils/userUtils';
import { assignUserRole } from '../../../Users/authorization/helpers/roleHelpers';
import db from '../../../../config/db';
import { Op } from 'sequelize';


const createOrUpdateServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Start a transaction
    const transaction = await db.transaction();

    try {
        // Step 1: Get the user ID from the token
        const user_id = getUserIdFromToken(req) ?? "";

        // Fetch user details with associations (include the transaction)
        const user = await Users.findOne({
            where: { id: user_id },
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
            transaction
        });

        if (!user) {
            await transaction.rollback();
            res.status(404).json(createResponse(false, "User not found"));
            return;
        }

        // Step 2: Validate input data
        const { value, errors } = validateInput(req.body);
        if (errors || !value) {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        const { first_name, last_name, phone_number, business_name } = value;

        // New Check: Ensure the phone number is not already registered with another provider
        const phoneExists = await ServiceProviders.findOne({
            where: {
                phone_number,
                user_id: { [Op.ne]: user_id } 
            },
            transaction
        });
        if (phoneExists) {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "Phone number is already registered with another provider."));
            return;
        }

        // Step 3: Check if a verification document already exists
        const verificationDocument = await VerificationDocuments.findOne({ 
            where: { user_id },
            transaction
        });
        if (verificationDocument) {
            await transaction.rollback();
            res.status(400).json(createResponse(false, "Contact support"));
            return;
        }

        // Step 4: Create verification document
        await VerificationDocuments.create({
            user_id,
            first_name,
            last_name,
            national_id: "",
            selfie: "",
            is_verified: true,
        }, { transaction });

        // Step 5: Create or update the service provider record
        let serviceProvider = await ServiceProviders.findOne({ where: { user_id }, transaction });
        if (!serviceProvider) {
            serviceProvider = await ServiceProviders.create({
                user_id,
                business_name,
                phone_number,
                status: 'approved',
            }, { transaction });
        } else {
            // If updating an existing record, you can update the phone number (if allowed) along with other details.
            await serviceProvider.update({ business_name, phone_number }, { transaction });
        }

        // Step 6: Update UserDetails (update first and last name)
        const userDetails = await UserDetails.findOne({ where: { user_id }, transaction });
        if (userDetails) {
            await userDetails.update({ first_name, last_name }, { transaction });
        }

        // Step 7: Assign role dynamically (e.g., 'service_provider')
        const assignedRole = 'service_provider';
        await assignUserRole(user_id, assignedRole, transaction);

        // Step 8: Notify the user about successful verification
        const notificationMessage = `You are now a service provider! You can now add services.`;
        await createNotifications(user_id, 'Verification Successful', notificationMessage);

        // Step 9: Commit the transaction and return a success response
        await transaction.commit();

        // Step 10: Reload updated user details
        const dataForState = await reloadUserWithDetails(user);

        res.status(200).json(createResponse(true, "Service provider details processed successfully", { dataForState }));

    } catch (error) {
        // Roll back the transaction if any step fails
        await transaction.rollback();
        handleError(error, req, res, "An error occurred while processing the service provider details");
    }
});


// Function to verify user approval
const verifyUserApproval = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.body;

        // Step 1: Fetch the verification document
        const verificationDocument = await VerificationDocuments.findOne({ where: { user_id } });

        if (!verificationDocument) {
            res.status(404).json(createResponse(false, 'Verification document not found'));
            return;
        }

        // Step 2: Check if the document is already verified
        if (verificationDocument.is_verified) {
            res.status(400).json(createResponse(false, 'User is already verified'));
            return;
        }

        // Step 3: Update the verification document to mark as verified
        verificationDocument.is_verified = true;
        verificationDocument.verification_date = new Date();
        await verificationDocument.save();

        // Step 4: Update the service provider status to approved
        const serviceProvider = await ServiceProviders.findOne({ where: { user_id } });

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, 'Service provider not found'));
            return;
        }

        serviceProvider.status = 'approved';
        serviceProvider.is_verified = true;
        await serviceProvider.save();

        const userNotificationTitle = "Account Verified";
        const verificationMessageForUser = "Congratulations! Your details have been successfully verified, and your account is now approved.";

        const verifierNotificationTitle = "User Verification Completed";
        const verificationMessageForVerifier = "You have successfully verified the user's details. Their account is now approved.";

        await createNotifications(serviceProvider?.user_id, userNotificationTitle, verificationMessageForUser);
        await createNotifications(user_id, verifierNotificationTitle, verificationMessageForVerifier);


        // Step 5: Return success response
        res.status(200).json(createResponse(true, 'User approved and verified successfully'));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while verifying the user');
    }
});

// Function to suspend, flag, or deactivate the service provider
const suspendOrFlagServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id, status } = req.body;

        // Step 1: Validate the input
        if (!user_id || !status) {
            res.status(400).json(createResponse(false, 'User ID and status are required'));
            return;
        }

        // Step 2: Fetch the service provider
        const serviceProvider = await ServiceProviders.findOne({ where: { user_id } });

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, 'Service provider not found'));
            return;
        }

        // Step 3: Update the service provider's status and flag if necessary
        serviceProvider.status = status; // Set the status to the value passed in the request
        serviceProvider.is_verified = (status === 'approved'); // Only set to true if status is 'approved'

        await serviceProvider.save();

        // Step 4: Send notification to the user based on the status change
        const notificationTitle = "Account Status Updated";
        const notificationMessage = `Your service provider account status has been updated to ${status}. Please contact support for more details.`;

        await createNotifications(user_id, notificationTitle, notificationMessage);

        // Step 5: Return success response
        res.status(200).json(createResponse(true, 'Service provider status updated successfully'));
    } catch (error) {
        handleError(error, req, res, 'An error occurred while updating the service provider status');
    }
});

export { suspendOrFlagServiceProvider, verifyUserApproval, createOrUpdateServiceProvider };


