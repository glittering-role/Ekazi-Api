import express from 'express';
import AppointmentRoutes from "./appointments";
import DefaultAvailabilityRoutes from './default_availability';
import BlockedDateRoutes from './blocked_dates';
import AvailabilityOverrideRoutes from './availability-overrides';
import BookingRoutes from './booking';


// Create a router
const apiV1BookingsRouter = express.Router();

// Setup route paths
apiV1BookingsRouter.use('/bookings', AppointmentRoutes);
apiV1BookingsRouter.use('/default-availability', DefaultAvailabilityRoutes);
apiV1BookingsRouter.use('/blocked-dates', BlockedDateRoutes);
apiV1BookingsRouter.use('/availability-overrides', AvailabilityOverrideRoutes);
apiV1BookingsRouter.use('/bookings', BookingRoutes);


export default apiV1BookingsRouter;
