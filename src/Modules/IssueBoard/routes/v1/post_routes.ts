import express from 'express';
import {
    getMyAllPosts,
    updatePost,
    deletePost,
    addPostImage,
    updateImageById,
    deleteImageById,
    togglePostStatus,
    updatePostVideo, // Import the new function
} from "../../controller/posts/post_controller";
import { verifyToken } from '../../../Users/middleware/jwt_auth';
import upload from '../../../../utils/multer/image_upload';
import { createPost } from "../../controller/posts/create_post";
import {getAllPosts, getSinglePost} from "../../controller/posts/global_posts";

const PostRouter = express.Router();

PostRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management
 */

/**
 * @swagger
 * /posts/create-post:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sub_category_id:
 *                 type: string
 *                 example: "5f7e8b9c9e0a8b001f2d9c8d"
 *               title:
 *                 type: string
 *                 example: Broken Sink
 *               description:
 *                 type: string
 *                 example: The sink in my kitchen is leaking.
 *               location:
 *                 type: string
 *                 example: New York, NY
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *               budget:
 *                 type: number
 *                 example: 100.00
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2023-12-31
 *               image_url:
 *                 type: string
 *                 format: binary
 *               video_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.post('/create-post', upload, createPost);

/**
 * @swagger
 * /posts/get-all-posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of posts.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.get('/get-all-posts', getAllPosts);

/**
 * @swagger
 * /posts/get-all-my-posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: A list of posts.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.get('/get-all-my-posts', getMyAllPosts);

/**
 * @swagger
 * /posts/get-post-by-id/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     responses:
 *       200:
 *         description: Post retrieved successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.get('/get-post-by-id/:id', getSinglePost);

/**
 * @swagger
 * /posts/update-post/{id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Title
 *               description:
 *                 type: string
 *                 example: Updated Description
 *               location:
 *                 type: string
 *                 example: Updated Location
 *               latitude:
 *                 type: number
 *                 example: 40.7128
 *               longitude:
 *                 type: number
 *                 example: -74.0060
 *               budget:
 *                 type: number
 *                 example: 150.00
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2023-12-31
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.patch('/update-post/:id', upload, updatePost);

/**
 * @swagger
 * /posts/update-video/{postId}:
 *   patch:
 *     summary: Update or remove a post's video
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post video updated successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.patch('/update-video/:postId', upload, updatePostVideo);

/**
 * @swagger
 * /posts/delete-post/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     responses:
 *       200:
 *         description: Post deleted successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.delete('/delete-post/:id', deletePost);

/**
 * @swagger
 * /posts/add-post-image/{postId}:
 *   post:
 *     summary: Add an image to a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image added successfully.
 *       400:
 *         description: No image file provided or maximum image limit reached.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.post('/add-post-image/:postId', upload, addPostImage);

/**
 * @swagger
 * /posts/update-image/{imageId}:
 *   patch:
 *     summary: Update an image by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image updated successfully.
 *       400:
 *         description: No image file provided.
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.patch('/update-image/:imageId', upload, updateImageById);

/**
 * @swagger
 * /posts/delete-image/{imageId}:
 *   delete:
 *     summary: Delete an image by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     responses:
 *       200:
 *         description: Image deleted successfully.
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.delete('/delete-image/:imageId', deleteImageById);

/**
 * @swagger
 * /posts/toggle-post-status/{postId}:
 *   patch:
 *     summary: Toggle post status (active/inactive)
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           example: uuid
 *     responses:
 *       200:
 *         description: Post status toggled successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
PostRouter.patch('/toggle-post-status/:postId', togglePostStatus);

export default PostRouter;