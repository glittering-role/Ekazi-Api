import { Request, Response } from "express";
import { asyncHandler } from "../../../../middleware/async-middleware";
import { createResponse } from "../../../../logs/helpers/response";
import { MulterRequest } from "../../../../types/interfaces/interfaces.common";
import { Post, PostImage } from "../../models/associations";
import { handleError } from "../../../../logs/helpers/erroHandler";
import { validateInput } from "../../../../utils/validation/validation";
import cloudinary from "../../../../config/cloudinary";
import { getUserIdFromToken } from "../../../../utils/user/get_userId";

// Helper function to upload images to Cloudinary
const uploadPostImages = async (files: Express.Multer.File[], post_id: string, transaction: any) => {
    for (const [index, file] of files.entries()) {
        const result = await cloudinary.v2.uploader.upload(file.path, {
            folder: "ekazi-api/posts",
        });
        // Save the image URL to the database within the transaction
        await PostImage.create(
            {
                post_id,
                image_url: result.secure_url,
                is_primary: index === 0,
            },
            { transaction }
        );
    }
};

// Create a new post
export const createPost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const transaction = await Post.sequelize?.transaction();
        try {
            const user_id = getUserIdFromToken(req) ?? "";

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

            const { title, description, location, latitude, longitude, budget, deadline, sub_category_id } = value;

            // Ensure a file was uploaded (image or video)
            const imageFiles = (req as MulterRequest).files?.filter(
                (file: { fieldname: string }) => file.fieldname === "image_url"
            );
            const videoFile = (req as MulterRequest).files?.find(
                (file: { fieldname: string }) => file.fieldname === "video_url"
            );

            let videoUrl = null;

            // Upload video to Cloudinary if provided
            if (videoFile) {
                const result = await cloudinary.v2.uploader.upload(videoFile.path, {
                    resource_type: "video",
                    folder: "ekazi-api/posts",
                });
                videoUrl = result.secure_url;
            }

            // Create the post within the transaction
            const post = await Post.create(
                {
                    user_id,
                    title,
                    description,
                    video_url: videoUrl,
                    location,
                    latitude,
                    longitude,
                    budget,
                    deadline,
                    sub_category_id: sub_category_id,
                    status: "open",
                },
                { transaction }
            );

            // Handle image uploads if any (within the transaction)
            if (imageFiles && imageFiles.length > 0) {
                await uploadPostImages(imageFiles, post.id, transaction);
            }

            // Commit the transaction if everything is successful
            await transaction?.commit();

            res
                .status(201)
                .json(createResponse(true, "Post created successfully", { post }));
        } catch (error: any) {
            // Rollback the transaction in case of an error
            await transaction?.rollback();
            handleError(
                error,
                req,
                res,
                "An error occurred while creating the post"
            );
        }
    }
);