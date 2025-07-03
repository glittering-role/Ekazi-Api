import express from 'express';

// Import route modules
import {serviceProvidersRouter} from "./provider_management/provider_management";
import newServiceProviderRouter from "./provider_management/new_service_provider_routes";
import {serviceRouter} from "./service/service_management";
import {GeneralSevicesRoutes} from "./service/general_services";
import {ServiceProvidersSearchRoutes} from "./service/service_filter";
import {ServiceProvidersRatingRoutes} from "./service/rating_routes";
import serviceOrderRouter from './serviceOrder/service_order';

// Create a router
const apiV1JobServicesRouter = express.Router();

// Setup route paths
apiV1JobServicesRouter.use('/services', serviceRouter);
apiV1JobServicesRouter.use('/service-providers', serviceProvidersRouter);
apiV1JobServicesRouter.use('/new_service-provider', newServiceProviderRouter);
apiV1JobServicesRouter.use('/services', GeneralSevicesRoutes);
apiV1JobServicesRouter.use('/services-filter', ServiceProvidersSearchRoutes);
apiV1JobServicesRouter.use('/services-rating', ServiceProvidersRatingRoutes);
apiV1JobServicesRouter.use('/service-orders', serviceOrderRouter);




export default apiV1JobServicesRouter;
