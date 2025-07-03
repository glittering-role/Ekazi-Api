import { Worker, Job } from "bullmq";
import logger from "../logs/helpers/logger";
import {redisBullConfig} from "../config/redis_config";

const notificationWorker = new Worker(
    "notifications",
    async (job: Job) => {
        const { notificationId, userId, notificationType, message } = job.data;
        try {
            logger.info(`Processing notification ${notificationId} for user ${userId}`);

        } catch (error: any) {
            logger.error(`Failed processing notification ${notificationId}`, {
                metadata: { error: error.message, stack: error.stack },
            });
            throw error; 
        }
    },
    { connection: redisBullConfig }
);

