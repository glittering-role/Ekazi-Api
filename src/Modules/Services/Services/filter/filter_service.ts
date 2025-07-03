import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { createResponse } from "../../../../logs/helpers/response";
import { Service, ServiceProviders } from "../../models/associations";
import { JobSubCategory } from "../../../JobCategories/models/association";
import { Ratings } from "../../models/associations";
import ServiceImage from "../../models/service_images";
import { UserDetails, Users } from "../../../Users/model/associations";
import { Op, Sequelize } from "sequelize";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";

const getServiceProvidersBySubcategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { subcategoryId } = req.params;
        const { location } = req.query;

        if (!subcategoryId) {
            res.status(400).json(createResponse(false, "Subcategory ID is required"));
            return;
        }

        const sequelize = Service.sequelize as Sequelize | undefined;
        if (!sequelize) {
            res.status(500).json(createResponse(false, "Database connection issue"));
            return;
        }

        const loggedInUserId = getUserIdFromToken(req);

        // Base where condition
        const whereCondition: any = {
            sub_category_id: subcategoryId,
            '$provider.user_id$': { [Op.ne]: loggedInUserId }
        };

        // Add location filter if provided
        if (location) {
            whereCondition.location = { [Op.like]: `%${location}%` };
        }

        // Fetch services with filtering and optimized attributes
        const services = await Service.findAll({
            where: whereCondition, 
            include: [
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
                    model: ServiceProviders,
                    as: 'provider',
                    where: {
                        is_online: true,
                        availability: 'available',
                        is_occupied: false,
                        status: 'approved'
                    },
                    attributes: ['id', 'user_id', 'business_name', 'work_description'],
                    include: [
                        {
                            model: Users,
                            as: 'user',
                            attributes: ['id', 'email', 'phone_number', 'username'],
                            include: [{
                                model: UserDetails,
                                attributes: ['id', 'first_name', 'last_name', 'image'],
                            }],
                        },
                    ],
                },
                {
                    model: Ratings,
                    as: 'serviceRatings',
                    attributes: ['id', 'rating', 'comment'],
                    include: [{
                        model: Users,
                        as: 'userWhoRated',
                        attributes: ['id', 'username'],
                    }],
                },
            ],
            attributes: [
                'id',
                'title',
                'description',
                'price_from',
                'price_to',
                'location',
                [sequelize.literal(`(SELECT AVG(rating) FROM ratings WHERE ratings.service_id = Service.id)`), 'averageRating']
            ],
            order: [[sequelize.literal('averageRating'), 'DESC']],
        });

        if (!services.length) {
            res.status(404).json(createResponse(false, "No services found for this subcategory"));
            return;
        }

        res.status(200).json(createResponse(true, "Services fetched successfully", { services }));

    } catch (error) {
        handleError(error, req, res, "An error occurred while fetching services");
    }
});

export { getServiceProvidersBySubcategory };