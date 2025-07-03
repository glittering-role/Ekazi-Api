import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import {Post, Bid, PostImage} from "../../models/associations";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";
import {handleError} from "../../../../logs/helpers/erroHandler";
import {validateInput} from "../../../../utils/validation/validation";
import jobSubCategory from "../../../JobCategories/models/jobSubCategory";
import {JobCategory} from "../../../JobCategories/models/association";
import validatePagination from "../../../../utils/pagination/pagination";
import paginate from "express-paginate";
import { createNotifications } from "../../../../Modules/Notifications/service/notificationService";

/**
 * Define a CustomRequest interface that includes an optional user property.
 */
interface CustomRequest extends Request {
    user?: {
        id: string;
        roles?: { role_name: string }[];
    };
}

// Create a new bid
const createBid = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user_id = getUserIdFromToken(req) ?? "";
            const customReq = req as CustomRequest;

            // Validate input
            const { value, errors } = validateInput(req.body);
            if (errors) {
                res
                    .status(400)
                    .json(createResponse(false, "Validation failed", { errors }));
                return;
            }

            // Ensure value is defined
            if (!value) {
                res.status(400).json(
                    createResponse(false, "Validation failed", {
                        errors: ["Invalid input data"],
                    })
                );
                return;
            }

            const { post_id, amount, comment } = value;

            // //check if user has a bid on this post
            // const check_ifExists = await Bid.findOne({where: { post_id, user_id }});
            // if (check_ifExists) {
            //     res.status(400).json(createResponse(false, "You have already placed a bid on this post"));
            //     return;
            // }

            // Check if the post exists
            const post = await Post.findByPk(post_id);
            if (!post) {
                res.status(404).json(createResponse(false, "Post not found"));
                return;
            }

            // Check if the user is trying to bid on their own post
            if (post.user_id === user_id) {
                res.status(400).json(createResponse(false, "You cannot bid on your own post"));
                return;
            }

            // Check if the post is inactive
            if (post.status !== "active") {
                res.status(400).json(createResponse(false, "You cannot bid on an inactive post"));
                return;
            }

            const userRoles = customReq?.user?.roles;            
            const isServiceProvider = userRoles?.some((role) => role.role_name === "service_provider");

            if (!isServiceProvider) {
                res.status(403).json(createResponse(false, "Only service providers can place bids"));
                return;
            }

            // Create the bid
            await Bid.create({
                post_id,
                user_id,
                amount,
                comment,
                status: "pending",
            });

            //send notification to the post owner
            if (post.user_id) {
                const notificationMessage = `You have a new bid on your post: ${post.title}`;
                await createNotifications(post.user_id, "New bid", notificationMessage);
            }

            //send notification to the  bider 
            if (user_id) {
                const notificationMessage = `You have successfully placed a bid on the post: ${post.title}`;
                await createNotifications(user_id, "Bid placed", notificationMessage);
            }

            res.status(201).json(createResponse(true, "Bid created successfully"));
        } catch (error) {
            handleError(error, req, res, "Error creating bid");
        }
    }
);


// Get all bids for a specific post
const getBidsForPost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { post_id } = req.params;
            const user_id = getUserIdFromToken(req) ?? "";

            const pagination = validatePagination(req, res, 1, 20);
            if (!pagination) return;

            const { page, limit } = pagination;
            const offset = (page - 1) * limit;

            // Check if the post exists
            const post = await Post.findByPk(post_id);
            if (!post) {
                res.status(404).json(createResponse(false, "Post not found"));
                return;
            }

            // Fetch bids for the post
            const bids = await Bid.findAll({
                where: { post_id, user_id },
                include: [
                    {
                        model: Post,
                        as: "post",
                        attributes: [
                            "id", "user_id", "title", "description", "image_url", "video_url",
                            "location", "latitude", "longitude", "status", "budget", "deadline", "created_at",
                        ],
                        include: [
                            {
                                model: PostImage,
                                as: "images",
                                attributes: ["id", "post_id", "image_url"],
                            },
                            {
                                model: jobSubCategory,
                                as: "subcategory",
                                attributes: ["id", "job_subcategory_name"],
                                include: [
                                    {
                                        model: JobCategory,
                                        as: "category",
                                        attributes: ["id", "job_category_name"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                order: [["created_at", "DESC"]],
                limit,
                offset,
            });

            // Calculate pagination metadata
            const itemCount = await Bid.count({ where: { post_id, user_id } });
            const pageCount = Math.ceil(itemCount / limit);

            res.status(200).json(
                createResponse(true, "Bids retrieved successfully", {
                    bids,
                    pagination: {
                        pageCount,
                        itemCount,
                        currentPage: page,
                        hasMore: paginate.hasNextPages(req)(pageCount),
                        pages: paginate.getArrayPages(req)(3, pageCount, page)
                    },
                })
            );
        } catch (error) {
            handleError(error, req, res, "Error retrieving bids");
        }
    }
);


// Delete a bid
const deleteBid = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { bid_id } = req.params;
            const user_id = getUserIdFromToken(req) ?? "";

            // Find the bid by ID
            const bid = await Bid.findOne({
                where: { id: bid_id, user_id },
            });

            if (!bid) {
                res.status(404).json(createResponse(false, "Bid not found"));
                return;
            }

            // Delete the bid
            await bid.destroy();
            res.status(200).json(createResponse(true, "Bid deleted successfully"));
        } catch (error) {
            handleError(error, req, res, "Error deleting bid");
        }
    }
);

export {
    createBid,
    getBidsForPost,
    deleteBid,
};