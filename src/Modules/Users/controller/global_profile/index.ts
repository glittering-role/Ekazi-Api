import { asyncHandler } from "../../../../middleware/async-middleware";
import { Request, Response } from "express";
import { UserDetails, UserLocation, Users } from "../../model/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { ServiceOrder, ServiceProviders, Service, Ratings } from "../../../../Modules/Services/models/associations";
import { createResponse } from "../../../../logs/helpers/response";

const globalProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const user_id = req.params.user_id;

        // Fetch user details from the database
        const user = await Users.findOne({
            where: { id: user_id },
            attributes: ["id", "email", "username", "createdAt"],
            include: [
                {
                    model: UserDetails,
                    attributes: ["first_name","middle_name", "last_name","gender","image","about_the_user"],
                },
                {
                    model: UserLocation,
                    attributes: ['country'],
                },
                {
                    model: ServiceProviders,
                    as: "serviceProvider",
                    attributes: [
                        "business_name","business_type",
                        "phone_number","business_location",
                        "work_description","years_of_experience",
                        "availability","is_verified",
                        "averageResponseTime","createdAt" 
                    ],
                },
            ],
        });

        // If user is not found, return a 404 response
        if (!user) {
            res.status(404).json({
                success: true,
                message: "User not found.",
               
            });
            return; 
        }

        // Fetch the count of completed services where the user is the provider
        const completedServicesCount = await ServiceOrder.count({
            where: {
                provider_user_id: user_id, 
                status: 'completed',
            },
        });

        // Step 1: Fetch all services provided by the user
        const services = await Service.findAll({
            include: [
                {
                    model: ServiceProviders,
                    as: "provider",
                    where: { user_id: user_id }, 
                    attributes: [],
                },
            ],
            attributes: ["id"], 
        });

        // Extract service IDs
        const serviceIds = services.map(service => service.id);

        // Step 2: Fetch all ratings for the services provided by the user
        const ratings = await Ratings.findAll({
            where: {
                service_id: serviceIds, 
            },
            attributes: ["rating"], 
        });

        // Step 3: Calculate the average rating
        let averageRating = 0;
        if (ratings.length > 0) {
            const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
            averageRating = totalRating / ratings.length;
        }

        // Step 4: Calculate the age of the service provider account
        const serviceProviderCreatedAt = user.serviceProvider?.createdAt;
        let accountAge = "N/A";

        if (serviceProviderCreatedAt) {
            const now = new Date();
            const createdAt = new Date(serviceProviderCreatedAt);
            const diffInMilliseconds = now.getTime() - createdAt.getTime();
            const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

            if (diffInDays < 30) {
                accountAge = `${diffInDays} day(s)`;
            } else if (diffInDays < 365) {
                const diffInMonths = Math.floor(diffInDays / 30);
                accountAge = `${diffInMonths} month(s)`;
            } else {
                const diffInYears = Math.floor(diffInDays / 365);
                accountAge = `${diffInYears} year(s)`;
            }
        }

        // Step 5: Additional analytics
        const totalServicesProvided = services.length; // Total services provided by the user
        const totalEarnings = await ServiceOrder.sum("amount", {
            where: {
                provider_user_id: user_id,
                status: "completed",
            },
        });

        // Exclude sensitive data from the response
        const { ...userWithoutSensitiveData } = user.toJSON();

        // Send the response with user details, completed services count, average rating, and additional analytics
        res.status(200).json(
            createResponse(false, "User details fetched successfully.", {
                    user: userWithoutSensitiveData,
                    completedServicesCount,
                    averageRating: parseFloat(averageRating.toFixed(2)), 
                    accountAge,
                    totalServicesProvided, 
                    totalEarnings: totalEarnings || 0, 
            })
        );
      
    } catch (error) {
        // Log and handle errors
        handleError(error, req, res, "Internal Server Error");
    }
});

export { globalProfile };