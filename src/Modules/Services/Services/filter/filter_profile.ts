import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { Service, ServiceOrder, ServiceProviders } from "../../models/associations";
import { JobSubCategory } from "../../../JobCategories/models/association";
import { Ratings } from "../../models/associations";
import ServiceImage from "../../models/service_images";
import { UserDetails, Users } from "../../../Users/model/associations";
import { Op } from "sequelize";


const getServiceProviderProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { serviceId } = req.params;

        const service = await Service.findByPk(serviceId, {
            include: [
                {
                    model: ServiceProviders,
                    as: 'provider',
                    include: [
                        {
                            model: Users,
                            as: 'user',
                            attributes: ['id', 'email', 'phone_number', 'username'],
                            include: [
                                {
                                    model: UserDetails,
                                    attributes: ['id', 'first_name', 'last_name', 'image'],
                                },
                            ],
                        }
                    ],
                    attributes: ['id', 'user_id', 'business_name', 'work_description', 'years_of_experience' , 'status','averageResponseTime'],
                },
                {
                    model: JobSubCategory,
                    as: 'subcategory',
                    attributes: ['id', 'job_subcategory_name'],
                },
                {
                    model: ServiceImage,
                    as: 'images',
                    attributes: ['id', 'image_url'],
                },
                {
                    model: Ratings,
                    as: 'serviceRatings',
                    attributes: ['id', 'rating', 'comment'],
                    include: [
                        {
                            model: Users,
                            as: 'userWhoRated',
                            attributes: ['id', 'username'],
                        },
                    ],
                },
            ],
            attributes: ['id', 'title', 'description', 'pricing_mode', 'price_from', 'price_to', 'location', 'postFor', 'service_location_preference' ,'longitude','latitude'],
        });

        if (!service) {
            res.status(404).json(createResponse(false, "Service not found"));
            return;
        }

        // Get the provider user ID
        const providerUserId = service.provider?.user_id;

        // Count completed jobs for the provider
        const completedJobsCount = providerUserId
            ? await ServiceOrder.count({
                  where: {
                      provider_user_id: providerUserId,
                      status: 'completed',
                  },
              })
            : 0;

        // Calculate aggregated rating data
        const ratings = await Ratings.findAll({
            where: { service_id: serviceId },
            attributes: ['rating'],
        });

        const totalReviews = ratings.length;
        const totalRating = ratings.reduce((sum, rating) => sum + Number(rating.rating), 0);
        const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "0";
        

        const ratingBreakdown = [1, 2, 3, 4, 5].map((star) => {
            const count = ratings.filter((rating) => rating.rating === star).length;
            const percentage = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(2) : "0";
            return { stars: star, count, percentage: parseFloat(percentage) };
        });

        // Add aggregated rating data and completed jobs count to the response
        const response = {
            ...service.toJSON(),
            ratingSummary: {
                totalReviews,
                averageRating: parseFloat(averageRating),
                ratingBreakdown,
            },
            completedJobsCount, 
        };

        res.status(200).json(createResponse(true, "Service and provider details fetched successfully", { service: response }));
    } catch (error) {
        handleError(error, req, res, "An error occurred while fetching the service and provider details");
    }
});

export { getServiceProviderProfile };