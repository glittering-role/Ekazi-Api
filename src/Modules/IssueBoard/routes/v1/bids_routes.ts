import express from 'express';
import {
    createBid,
    getBidsForPost,
    deleteBid,
} from "../../controller/bids/bids";
import { verifyToken } from '../../../Users/middleware/jwt_auth';
import {attachUserRoles} from "../../../Users/middleware/attachUserRoles";

const BidRouter = express.Router();

BidRouter.use(verifyToken);


/**
 * @swagger
 * tags:
 *   name: Bids
 *   description: Bid management
 */

/**
 * @swagger
 * /bids/create-bid:
 *   post:
 *     summary: Create a new bid on a post
 *     tags: [Bids]
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
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               comment:
 *                 type: string
 *                 example: "I can fix this issue within 2 days."
 *     responses:
 *       201:
 *         description: Bid created successfully.
 *       400:
 *         description: Validation failed or missing fields.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
BidRouter.post('/create-bid', attachUserRoles, createBid);

/**
 * @swagger
 * /bids/get-bids-for-post/{post_id}:
 *   get:
 *     summary: Get all bids for a specific post
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "uuid-of-post"
 *     responses:
 *       200:
 *         description: Bids retrieved successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal Server Error.
 */
BidRouter.get('/get-bids-for-post/:post_id', getBidsForPost);

/**
 * @swagger
 * /bids/delete-bid/{bid_id}:
 *   delete:
 *     summary: Delete a bid
 *     tags: [Bids]
 *     parameters:
 *       - in: path
 *         name: bid_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "uuid-of-bid"
 *     responses:
 *       200:
 *         description: Bid deleted successfully.
 *       404:
 *         description: Bid not found.
 *       500:
 *         description: Internal Server Error.
 */
BidRouter.delete('/delete-bid/:bid_id', deleteBid);

export default BidRouter;