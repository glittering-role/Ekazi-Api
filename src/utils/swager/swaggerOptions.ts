import dotenv from 'dotenv';

dotenv.config();

const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'Ekazi - API',
            version: '1.0.0',
            description: '',
            license: {
                name: 'MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Ekazi Api',
                email: 'ekazilimited@gmail.com',
            },
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                    ? process.env.PRODUCTION_URL + '/api/v1' 
                    : process.env.BASE_URL + '/api/v1',
                description: process.env.NODE_ENV === 'production' 
                    ? 'Production Server' 
                    : 'Local Development Server',
            },
        ],
        components: {},
    },
    security: [],
    apis: [
        './src/logs/**/*.ts',
        './src/Modules/Users/**/*.ts',
        './src/Modules/Notifications/**/*.ts',
        './src/Modules/JobCategories/**/*.ts',
        './src/Modules/Services/**/*.ts',
        './src/Modules/Bookings/**/*.ts',
        './src/Modules/Payments/**/*.ts',
        './src/Modules/Subscriptions/**/*.ts',
        './src/Modules/System/**/*.ts',
        './src/Modules/IssueBoard/**/*.ts',


    ],
};

export default options;
