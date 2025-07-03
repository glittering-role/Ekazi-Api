import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { validateInput } from "../../../../utils/validation/validation";
import {ServiceProviders} from "../../models/associations";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";
import { Op } from "sequelize";
import Users from "../../../Users/model/user/user";
import validatePagination from "../../../../utils/pagination/pagination";
import paginate from "express-paginate";
import {UserDetails} from "../../../Users/model/associations";


// Get all service providers
const getAllServiceProviders = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, is_online, is_occupied } = req.query; // Extract search and filters

        // Build the `where` condition for ServiceProviders
        const serviceProviderWhere: any = { status: 'approved' }; // Only include 'approved' service providers

        // Build the `where` condition for Users
        const userWhere: any = {};
        if (search) {
            userWhere[Op.or] = [
                { email: { [Op.iLike]: `%${search}%` } },
                { username: { [Op.iLike]: `%${search}%` } },
                { phone_number: { [Op.iLike]: `%${search}%` } },
            ];
        }

        let pagination: any = null;
        let serviceProviders: any;
        let itemCount: number;

        if (search || is_online || is_occupied) {
            // If search or filters are applied, disable pagination
            serviceProviders = await ServiceProviders.findAll({
                where: serviceProviderWhere,
                include: {
                    model: Users,
                    as: 'user',
                    where: userWhere,
                    attributes: ['email', 'username', 'phone_number'], // Include required fields
                },
            });
            itemCount = serviceProviders.length;
        } else {
            // Apply pagination if no search or filters
            pagination = validatePagination(req, res, 1, 20);
            if (!pagination) return; // Return early if validation fails
            const { page, limit } = pagination;
            const offset = (page - 1) * limit;

            const [fetchedServiceProviders, totalItemCount] = await Promise.all([
                ServiceProviders.findAll({
                    where: serviceProviderWhere,
                    include: {
                        model: Users,
                        as: 'user',
                        where: userWhere,
                        attributes: ['email', 'username', 'phone_number'],
                    },
                    offset,
                    limit,
                }),
                ServiceProviders.count({
                    where: serviceProviderWhere,
                    include: {
                        model: Users,
                        as: 'user',
                        where: userWhere,
                    },
                }),
            ]);

            serviceProviders = fetchedServiceProviders;
            itemCount = totalItemCount;
        }

        // Calculate pageCount if pagination is applied
        const pageCount = pagination ? Math.ceil(itemCount / pagination.limit) : 1;

        res.status(200).json(createResponse(true, "Service providers retrieved successfully", {
            serviceProviders,
            meta: pagination ? {
                pageCount,
                itemCount,
                currentPage: pagination.page,
                hasMore: paginate.hasNextPages(req)(pageCount),
                pages: paginate.getArrayPages(req)(3, pageCount, pagination.page),
            } : {},
        }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while fetching service providers");
    }
});

// Get a service provider by ID
const getServiceProviderById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req); // Extract user_id from token

        const serviceProvider = await ServiceProviders.findOne({
            where: { user_id:user_id },
            include: [
                {
                    model: Users,
                    as: 'user',
                    attributes: ["id", "email", "phone_number", "username", "status"],
                    include: [
                        {
                            model: UserDetails,
                            attributes: [
                                "first_name",
                                "middle_name",
                                "last_name",
                                "gender",
                                "image",
                            ],
                        },
                    ],
                },
            ],
        });

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        // Respond with retrieved data
        res.status(200).json(
            createResponse(true, "Service provider retrieved successfully", { serviceProvider })
        );
    } catch (error) {
        handleError(error, req, res, "An error occurred while fetching the service provider");
    }
});

// Update a service provider
const updateServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);
        const serviceProvider = await ServiceProviders.findByPk(user_id);

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        const { value, errors } = validateInput(req.body);
        if (errors) {
            res.status(400).json(createResponse(false, "Validation failed", { errors }));
            return;
        }

        if (!value) {
            res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
            return;
        }

        const { business_name, business_location,business_type, work_description, availability, phone_number , years_of_experience } = value;


        // Update fields dynamically, ensuring that undefined values are excluded
        const updatedFields: Partial<ServiceProviders> = {
            ...(years_of_experience && { years_of_experience }),
            ...(business_name && { business_name }),
            ...(business_type && { business_type }),
            ...(phone_number && { phone_number }),
            ...(business_location && { business_location }),
            ...(work_description && { work_description }),
            ...(availability && { availability }),
        };

        await serviceProvider.update(updatedFields);

        res.status(200).json(createResponse(true, "Service provider updated successfully", { serviceProvider }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while updating the service provider");
    }
});

// Delete a service provider
const deleteServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        const serviceProvider = await ServiceProviders.findByPk(user_id);

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        await serviceProvider.destroy();
        res.status(200).json(createResponse(true, "Service provider deleted successfully"));
    } catch (error) {
        handleError(error, req, res, "An error occurred while deleting the service provider");
    }
});

// Toggle service provider status
const toggleServiceProviderStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        const serviceProvider = await ServiceProviders.findByPk(user_id);

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, "Service provider not found"));
            return;
        }

        serviceProvider.is_verified = !serviceProvider.is_verified;
        await serviceProvider.save();

        const message = serviceProvider.is_verified
            ? "Service provider verified successfully"
            : "Service provider unverified successfully";
        res.status(200).json(createResponse(true, message, { serviceProvider }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while toggling the service provider status");
    }
});

const softDeleteServiceProvider = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = getUserIdFromToken(req);

        // Find the service provider by user_id
        const serviceProvider = await ServiceProviders.findOne({ where: { user_id } });

        if (!serviceProvider) {
            res.status(404).json(createResponse(false, 'Service provider not found'));
            return;
        }

        // Update the status to 'deactivated' if not already deactivated
        const updatedStatus = serviceProvider.status === 'deactivated' ? 'approved' : 'deactivated';
        await serviceProvider.update({ status: updatedStatus });

        res.status(200).json(createResponse(true, `Service provider status updated to '${updatedStatus}' successfully`));
    } catch (error) {
        handleError(error, req, res, "Failed to update service provider status");
    }
});


export {
    getAllServiceProviders,
    getServiceProviderById,
    updateServiceProvider,
    deleteServiceProvider,
    toggleServiceProviderStatus,
    softDeleteServiceProvider
};
