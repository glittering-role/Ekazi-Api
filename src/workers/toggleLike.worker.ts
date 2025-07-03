import { Worker, Job } from "bullmq";
import db from "../config/db";
import { Like } from "../Modules/IssueBoard/models/associations";
import logger from "../logs/helpers/logger";
import {redisBullConfig} from "../config/redis_config";

interface JobData {
    user_id: string;
    post_id: string;
}

const toggleLikeWorker = new Worker(
    "toggleLikeQueue",
    async (job: Job<JobData>) => {
        const { user_id, post_id } = job.data;
        const transaction = await db.transaction();

        try {
            const existingLike = await Like.findOne({
                where: { post_id, user_id },
                transaction,
            });

            if (existingLike) {
                await existingLike.destroy({ transaction });
                // logger.info(`❌ User ${user_id} unliked post ${post_id}`);
            } else {
                await Like.create({ post_id, user_id }, { transaction });
                // logger.info(`❤️ User ${user_id} liked post ${post_id}`);
            }

            await transaction.commit();
        } catch (error: any) {
            await transaction.rollback();
            logger.error("❗ Error toggling like", {
                post_id,
                user_id,
                error: error.message,
            });
            throw error; 
        }
    },
    { connection: redisBullConfig }
);

