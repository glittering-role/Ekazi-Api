import express from 'express';
import notificationsRoutes from './notificationsRoutes';

// Create a router
const apiV1NotificationRouter = express.Router();

// Setup route paths
apiV1NotificationRouter.use('/notifications', notificationsRoutes)


export default apiV1NotificationRouter;