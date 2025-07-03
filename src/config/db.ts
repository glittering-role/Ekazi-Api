import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
dotenv.config();

// Type for the environment variables
interface EnvConfig {
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    DB_DIALECT?: string;
}

const envConfig: EnvConfig = {
    DB_NAME: process.env.DB_NAME!,
    DB_USER: process.env.DB_USER!,
    DB_PASSWORD: process.env.DB_PASSWORD!,
    DB_HOST: process.env.DB_HOST!,
    DB_DIALECT: process.env.DB_DIALECT || 'mysql'
};


const db = new Sequelize(
    envConfig.DB_NAME,
    envConfig.DB_USER,
    envConfig.DB_PASSWORD,
    {
        host: envConfig.DB_HOST,
        dialect: envConfig.DB_DIALECT as 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export default db;
