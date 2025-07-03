import express, { Application, Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import http, { Server } from 'http';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import * as path from 'node:path';
import cookieParser from 'cookie-parser';

import './src/workers/tasks/tasks';

dotenv.config();

// Routes
import swaggerOptions from './src/utils/swager/swaggerOptions';
import { apiV1LogRouter } from './src/logs/routes/v1';
import Db from './src/config/db';
import apiV1UserRouter from './src/Modules/Users/routes/v1';
import apiV1NotificationRouter from './src/Modules/Notifications/routes/v1';
import apiV1JobCategoryRouter from './src/Modules/JobCategories/routes/v1';
import apiV1JobServicesRouter from './src/Modules/Services/routes/v1';
import apiV1BookingsRouter from './src/Modules/Bookings/routes/v1';
import apiV1SettingsRouter from './src/Modules/System/routes/v1';
import apiV1JobPostsRouter from "./src/Modules/IssueBoard/routes/v1";


// Middlewares
import { mpesaAccessToken } from './src/Modules/Payments/middleware/mpesa_access_token';
import apiV1MpesaPaymentRouters from './src/Modules/Payments/routes/v1';
import apiV1SubscriptionRouter from './src/Modules/Subscriptions/routes/v1';
import { socketIoConfig } from './src/config/ws';

const app: Application = express();
const server: Server = http.createServer(app);

// Define CORS options with proper types
const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
        const allowedOrigins = [
            process.env.CLIENT_URL,
            process.env.EXPO_DEV,
            process.env.BASE_URL,
            process.env.PRODUCTION_URL,
        ];
        if (allowedOrigins.includes(origin as string) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
};



// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.set('trust proxy', true);
app.use(cookieParser());
//app.use(mpesaAccessToken)

// Middleware to attach req to the socket handshake
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).socketHandshake = req;
    next();
});

// Initialize Socket.IO
socketIoConfig(server);

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', {
        serverName: 'Ekazi server',
        backgroundImage: 'your-background-image.jpg',
        image: 'your-image.jpg',
        apiDocsUrl: process.env.PRODUCTION_URL + '/api-docs',
    });
});

// Use the router for API v1 logs
app.use('/api/v1', apiV1LogRouter);
app.use('/api/v1', apiV1UserRouter);
app.use('/api/v1', apiV1NotificationRouter);
app.use('/api/v1', apiV1JobCategoryRouter);
app.use('/api/v1', apiV1JobServicesRouter);
app.use('/api/v1', apiV1BookingsRouter);
app.use('/api/v1', apiV1MpesaPaymentRouters);
app.use('/api/v1', apiV1SubscriptionRouter);
app.use('/api/v1', apiV1SettingsRouter);
app.use('/api/v1', apiV1JobPostsRouter);


const port: string | number = process.env.PORT || 5000;

Db.sync()
    .then(() => {
        const baseUrl = process.env.PRODUCTION_URL || `http://localhost:${port}`;
        server.listen(port, () => {
            console.log(`Server is running on port ${baseUrl}`);
        });
    })
    .catch((error: Error) => {
        console.error('Internal Server Error:', error.message);
    });


export default app;