import express from 'express';
// Import route modules
import MpesaPaymentRouters from "./mpesa/mpesa_routes";

// Create a router
const apiV1MpesaPaymentRouters = express.Router();

// Setup route paths
apiV1MpesaPaymentRouters.use('/checkout', MpesaPaymentRouters);


export default apiV1MpesaPaymentRouters;