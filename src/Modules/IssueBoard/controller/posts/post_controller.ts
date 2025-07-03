import { Request, Response } from "express";
import cloudinary from "../../../../config/cloudinary";
import paginate from "express-paginate";
import {validateInput} from "../../../../utils/validation/validation";
import {asyncHandler} from "../../../../middleware/async-middleware";
import {createResponse} from "../../../../logs/helpers/response";
import {MulterRequest} from "../../../../types/interfaces/interfaces.common";
import {Post , PostImage} from "../../models/associations";
import {handleError} from "../../../../logs/helpers/erroHandler";
import validatePagination from "../../../../utils/pagination/pagination";
import {buildPostQueryOptions} from "./global_posts";
import {getUserIdFromToken} from "../../../../utils/user/get_userId";


// Get all posts with pagination
const getMyAllPosts = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const user_id = getUserIdFromToken(req) ?? "";

            const pagination = validatePagination(req, res, 1, 20);
            if (!pagination) return;

            const { page, limit } = pagination;

            // Calculate offset
            const offset = (page - 1) * limit;

            const [posts, itemCount] = await Promise.all([
                Post.findAll({
                    ...buildPostQueryOptions(),
                    where: { user_id: user_id},
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
                        pages: paginate.getArrayPages(req)(3, pageCount, page),
                    },
                })
            );
        } catch (error) {
            handleError(error, req, res, "Error retrieving posts");
        }
    }
);


// Update a post
const updatePost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Find the post by ID
            const post = await Post.findByPk(id);
            if (!post) {
                res.status(404).json(createResponse(false, "Post not found"));
                return;
            }

            const { value, errors } = validateInput(req.body);
            if (errors) {
                res
                    .status(400)
                    .json(createResponse(false, "Validation failed", { errors }));
                return;
            }

            // Update the post fields if provided
            if (value?.title) post.title = value.title;
            if (value?.description) post.description = value.description;
            if (value?.location) post.location = value.location;
            if (value?.latitude) post.latitude = value.latitude;
            if (value?.longitude) post.longitude = value.longitude;
            if (value?.budget) post.budget = value.budget;
            if (value?.deadline) post.deadline = value.deadline;
            if ( value?.sub_category_id) post.sub_category_id = (value.sub_category_id)

            // Handle video update
            const videoFile = (req as MulterRequest).files?.find(
                (file: { fieldname: string }) => file.fieldname === "video_url"
            );
            if (videoFile) {
                // Delete the old video from Cloudinary if it exists
                if (post.video_url) {
                    const oldVideoPublicId = post.video_url.split("/").pop()?.split(".")[0];
                    if (oldVideoPublicId) {
                        await cloudinary.v2.uploader.destroy(`posts/${oldVideoPublicId}`, {
                            resource_type: "video",
                        });
                    }
                }

                // Upload the new video to Cloudinary
                const result = await cloudinary.v2.uploader.upload(videoFile.path, {
                    resource_type: "video",
                    folder: "posts",
                });
                post.video_url = result.secure_url;
            }

            // Save the changes
            await post.save();
            res.status(200).json(createResponse(true, "Post updated successfully"));
        } catch (error) {
            handleError(error, req, res, "An error occurred while updating the post");
        }
    }
);

const addPostImage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;


        // Find the post by ID
        const post = await Post.findByPk(postId);
        if (!post) {
            res.status(404).json(createResponse(false, 'Post not found'));
            return;
        }

        // Check the number of existing images
        const existingImages = await PostImage.count({ where: { post_id: postId } }); // Changed from service_id to post_id
        if (existingImages >= 7) {
            res.status(400).json(createResponse(false, 'You can only upload up to 7 images for a post'));
            return;
        }

        // Check if an image file is provided
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (!imageFile) {
            res.status(400).json(createResponse(false, 'No image file provided'));
            return;
        }

        // Upload image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api/posts' }); // Updated folder name

        // Save image to database
        const newImage = await PostImage.create({
            post_id: postId, // Changed from service_id to post_id
            image_url: result.secure_url,
            is_primary: existingImages === 0 // Set the first image as primary
        });

        res.status(201).json(createResponse(true, 'Image added successfully', { newImage }));
    } catch (error) {
        handleError(error, req, res, 'Error adding post image');
    }
});


// Function to update an image by ID
const updateImageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { imageId } = req.params;

        // Find the image by ID
        const image = await PostImage.findOne({ where: { id: imageId } });

        if (!image) {
            res.status(404).json(createResponse(false, 'Image not found'));
            return;
        }

        // Fetch the current image URL to delete from Cloudinary
        const currentImageUrl = image.image_url;

        if (currentImageUrl) {
            // Extract public ID from URL for Cloudinary removal
            const publicId = currentImageUrl.split('/').pop()?.split('.')[0];
            if (publicId) {
                // Wait for Cloudinary to remove the image
                const cloudinaryResult = await cloudinary.v2.uploader.destroy(`ekazi-api/posts/${publicId}`); // Updated folder name

                if (cloudinaryResult.result !== 'ok') {
                    handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An error occurred while removing image from Cloudinary');
                    return;
                }
            }
        }

        // Check if an image file is provided and update it
        const imageFile = (req as MulterRequest).files?.find((file: { fieldname: string; }) => file.fieldname === 'image');
        if (imageFile) {
            // Upload the new image to Cloudinary
            const result = await cloudinary.v2.uploader.upload(imageFile.path, { folder: 'ekazi-api/posts' }); // Updated folder name
            image.image_url = result.secure_url;
        }

        // Update the image URL in the database
        await image.save();

        // Respond with success message
        res.status(200).json(createResponse(true, 'Image updated successfully', { image }));
    } catch (error) {
        handleError(error, req, res, 'Error updating post image');
    }
});


// Function to delete an image by ID
const deleteImageById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { imageId } = req.params;

        // Find the image by ID
        const image = await PostImage.findOne({ where: { id: imageId } });

        if (!image) {
            res.status(404).json(createResponse(false, 'Image not found'));
            return;
        }

        // Remove the image from Cloudinary
        const publicId = image.image_url.split('/').pop()?.split('.')[0];
        if (publicId) {
            const cloudinaryResult = await cloudinary.v2.uploader.destroy(`ekazi-api/posts/${publicId}`); // Updated folder name

            if (cloudinaryResult.result !== 'ok') {
                handleError(new Error('Failed to remove image from Cloudinary'), req, res, 'An error occurred while removing image from Cloudinary');
                return;
            }
        }

        // Delete the image from the database
        await PostImage.destroy({ where: { id: imageId } });

        // Respond with success message
        res.status(200).json(createResponse(true, 'Image deleted successfully'));
    } catch (error) {
        handleError(error, req, res, 'Error deleting post image');
    }
});

const togglePostStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;

        // Find the post by ID
        const post = await Post.findByPk(postId);
        if (!post) {
            res.status(404).json(createResponse(false, 'Post not found'));
            return;
        }

        // Toggle the status
        post.status = post.status === 'active' ? 'inactive' : 'active';
        await post.save();

        res.status(200).json(createResponse(true, 'Post status toggled successfully', { status: post.status }));
    } catch (error) {
        handleError(error, req, res, 'Error toggling post status');
    }
});


const updatePostVideo = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { postId } = req.params;

            // Find the post by ID
            const post = await Post.findByPk(postId);
            if (!post) {
                res.status(404).json(createResponse(false, "Post not found"));
                return;
            }

            // Check if a video file is provided
            const videoFile = (req as MulterRequest).files?.find(
                (file: { fieldname: string }) => file.fieldname === "video_url"
            );

            // If no video file is provided, remove the existing video
            if (!videoFile) {
                if (post.video_url) {
                    // Delete the old video from Cloudinary
                    const oldVideoPublicId = post.video_url.split("/").pop()?.split(".")[0];
                    if (oldVideoPublicId) {
                        await cloudinary.v2.uploader.destroy(`posts/${oldVideoPublicId}`, {
                            resource_type: "video",
                        });
                    }
                    post.video_url = null; // Remove the video URL from the post
                }
            } else {
                // Upload the new video to Cloudinary
                const result = await cloudinary.v2.uploader.upload(videoFile.path, {
                    resource_type: "video",
                    folder: "posts",
                });
                post.video_url = result.secure_url;
            }

            // Save the changes
            await post.save();
            res.status(200).json(createResponse(true, "Post video updated successfully"));
        } catch (error) {
            handleError(error, req, res, "An error occurred while updating the post video");
        }
    }
);

// Delete a post
const deletePost = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await Post.findByPk(id);
            if (!post) {
                res.status(404).json(createResponse(false, "Post not found"));
                return;
            }

            // Delete the image from Cloudinary if it exists
            if (post.image_url) {
                const oldImagePublicId = post.image_url.split("/").pop()?.split(".")[0];
                if (oldImagePublicId) {
                    await cloudinary.v2.uploader.destroy(`posts/${oldImagePublicId}`);
                }
            }

            // Delete the video from Cloudinary if it exists
            if (post.video_url) {
                const oldVideoPublicId = post.video_url.split("/").pop()?.split(".")[0];
                if (oldVideoPublicId) {
                    await cloudinary.v2.uploader.destroy(`posts/${oldVideoPublicId}`, {
                        resource_type: "video",
                    });
                }
            }

            // Delete the post
            await post.destroy();
            res.status(200).json(createResponse(true, "Post deleted successfully"));
        } catch (error) {
            handleError(error, req, res, "An error occurred while deleting the post");
        }
    }
);

export {
    getMyAllPosts,
    updatePost,
    deletePost,
    addPostImage,
    updateImageById,
    deleteImageById,
    togglePostStatus,
    updatePostVideo
};