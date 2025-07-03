import { Request, Response } from "express";
import paginate from "express-paginate";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { Post, PostImage, Bid, Comment } from "../../models/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import validatePagination from "../../../../utils/pagination/pagination";
import jobSubCategory from "../../../JobCategories/models/jobSubCategory";
import { JobCategory } from "../../../JobCategories/models/association";
import { UserDetails, Users } from "../../../Users/model/associations";
import CommentReplies from "../../models/comments_reactions";
import Sequelize from "sequelize";

// Utility function to include user details with a unique alias
const includeUserDetails = (alias: string) => ({
    model: Users,
    as: alias,
    attributes: ["id", "username"],
    include: [
        {
            model: UserDetails,
            attributes: ["id", "first_name", "last_name", "image"],
        },
    ],
});

// Reusable function to build the query options for fetching posts
export const buildPostQueryOptions = () => ({
    attributes: [
        "id", "user_id", "title", "description", "image_url", "video_url", "location", "latitude", "longitude", "status", "budget", "deadline", "created_at",
        [Sequelize.literal(`(SELECT COUNT(*) FROM likes WHERE likes.post_id = Post.id)`), "like_count"] as [Sequelize.Utils.Literal, string]
    ],

    include: [
        { model: PostImage, as: "images", attributes: ["id", "post_id", "image_url"] },
        {
            model: jobSubCategory,
            as: "subcategory",
            attributes: ["id", "job_subcategory_name"],
            include: [{ model: JobCategory, as: "category", attributes: ["id", "job_category_name"] }]
        },
        {
            model: Bid,
            as: "bids",
            attributes: ["id", "user_id", "amount", "comment", "status", "created_at"],
            include: [includeUserDetails("user")]
        },
        {
            model: Comment,
            as: "comments",
            attributes: ["id", "user_id", "comment", "created_at"],
            include: [
                includeUserDetails("user"),
                {
                    model: CommentReplies,
                    as: "replies",
                    attributes: ["id", "user_id", "comment", "created_at"],
                    include: [includeUserDetails("user")]
                }
            ]
        },
        includeUserDetails("user"),
    ],
});

// Get all posts with pagination
export const getAllPosts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const pagination = validatePagination(req, res, 1, 20);
        if (!pagination) return;

        const { page, limit } = pagination;
        const offset = (page - 1) * limit;

        const [posts, itemCount] = await Promise.all([
            Post.findAll({
                ...buildPostQueryOptions(),
                where: { status: "open" },
                offset,
                limit,
            }),
            Post.count({ where: { status: "open" } }),
        ]);

        const pageCount = Math.ceil(itemCount / limit);

        res.status(200).json(
            createResponse(true, "Posts retrieved successfully", {
                posts,
                meta: {
                    pageCount,
                    itemCount,
                    currentPage: page,
                    hasMore: paginate.hasNextPages(req)(pageCount),
                    pages: paginate.getArrayPages(req)(3, pageCount, page)
                },
            })
        );
    } catch (error) {
        handleError(error, req, res, "Error retrieving posts");
    }
});

// Get a single post by ID
export const getSinglePost = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({
            ...buildPostQueryOptions(),
            where: { id, status: "open" },
        });

        if (!post) {
            res.status(404).json(createResponse(false, "Post not found"));
            return;
        }

        res.status(200).json(createResponse(true, "Post retrieved successfully", { post }));
    } catch (error) {
        handleError(error, req, res, "Error retrieving post");
    }
});
