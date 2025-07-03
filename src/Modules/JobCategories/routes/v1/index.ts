import express from 'express';

// Import route modules
import CategoryRouter from './category_routes';
import SubCategoryRouter from './sub_category_routes';


// Create a router
const apiV1JobCategoryRouter = express.Router();

// Setup route paths
apiV1JobCategoryRouter.use('/category', CategoryRouter);
apiV1JobCategoryRouter.use('/subcategories', SubCategoryRouter);


export default apiV1JobCategoryRouter;
