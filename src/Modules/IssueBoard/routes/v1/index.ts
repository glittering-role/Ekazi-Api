import express from 'express';
import PostRouter from "./post_routes";
import BidRouter from "./bids_routes";
import PostReactionRouter from "./reaction_routes";

// Create a router
const apiV1JobPostsRouter = express.Router();

// Setup route paths
apiV1JobPostsRouter.use('/posts',PostRouter);
apiV1JobPostsRouter.use('/bids',BidRouter);
apiV1JobPostsRouter.use('/post-reactions',PostReactionRouter);


export default apiV1JobPostsRouter;
