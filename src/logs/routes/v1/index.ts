import express from 'express';
import LogsRoute from './logRoutes';

// Create a router
export const apiV1LogRouter = express.Router();

// Setup route paths
apiV1LogRouter.use('/logs', LogsRoute);

