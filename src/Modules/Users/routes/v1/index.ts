import express from 'express';

// Import route modules
import RolesRouter from './roleRoutes';
import UserRouter from './userRoutes';
import ProfileRouter from './accountProfileRoutes';
import SecurityRouter from './accountSecurityRoutes';
import AuthRouter from './authRoutes';
import GlobalProfileRouter from "./global_profile";


// Create a router
const apiV1UserRouter = express.Router();

// Setup route paths
apiV1UserRouter.use('/auth', AuthRouter);
apiV1UserRouter.use('/profile', ProfileRouter);
apiV1UserRouter.use('/roles', RolesRouter);
apiV1UserRouter.use('/user', UserRouter);
apiV1UserRouter.use('/security', SecurityRouter);
apiV1UserRouter.use('/global_profile', GlobalProfileRouter)


export default apiV1UserRouter;
