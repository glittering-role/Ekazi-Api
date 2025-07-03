import express from 'express';
import { verifyToken } from '../../../Users/middleware/jwt_auth';
import toggleLike from "../../controller/reactions/like_posts";
import {createComment, deleteComment} from "../../controller/reactions/post_comments";

const PostReactionRouter = express.Router();

PostReactionRouter.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Reactions
 *   description: Post reactions and comments management
 */

/**
 * @swagger
 * /post-reactions/toggle-like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Reactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: string
 *                 example: "uuid-of-post"
 *     responses:
 *       200:
 *         description: Post unliked successfully.
 *       201:
 *         description: Post liked successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       500:
 *         description: Internal Server Error.
 */
PostReactionRouter.post('/toggle-like', toggleLike);

/**
 * @swagger
 * /post-reactions/comments:
 *   post:
 *     summary: Create a comment or reply on a post
 *     tags: [Reactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: string
 *                 example: "uuid-of-post"
 *               comment:
 *                 type: string
 *                 example: "This is a great post!"
 *               parent_comment_id:
 *                 type: string
 *                 example: "uuid-of-parent-comment"
 *                 description: "Required only for replies. Omit for top-level comments."
 *     responses:
 *       201:
 *         description: Comment or reply created successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: Parent comment not found or does not belong to this post.
 *       500:
 *         description: Internal Server Error.
 */
PostReactionRouter.post('/comments', createComment);

/**
 * @swagger
 * /post-reactions/comments/{comment_id}:
 *   delete:
 *     summary: Delete a comment or reply
 *     tags: [Reactions]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "uuid-of-comment"
 *     responses:
 *       200:
 *         description: Comment or reply deleted successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Comment or reply not found or you do not have permission to delete it.
 *       500:
 *         description: Internal Server Error.
 */
PostReactionRouter.delete('/comments/:comment_id', deleteComment);

export default PostReactionRouter;