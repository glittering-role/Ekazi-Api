import express from 'express';
import subscriptionPlansRoutes from "./subscriptions_plans";
import MakeSubscriptionRouters from "./make_subscription";
import subscriptionRoutes from "./subscription";

// Import route modules

// Create a router
const apiV1SubscriptionRouter = express.Router();

// Setup route paths
apiV1SubscriptionRouter.use('/plans', subscriptionPlansRoutes);
apiV1SubscriptionRouter.use('/subscriptions', subscriptionRoutes);
apiV1SubscriptionRouter.use('/checkout', MakeSubscriptionRouters);



export default  apiV1SubscriptionRouter;