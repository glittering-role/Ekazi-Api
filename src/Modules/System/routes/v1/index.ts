import express from 'express';


import searchRoutes from './integratedSearch';

// Create a router
const apiV1SettingsRouter = express.Router();


apiV1SettingsRouter.use('/search' , searchRoutes);



export default apiV1SettingsRouter;