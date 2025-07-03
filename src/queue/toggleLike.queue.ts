import { Queue } from "bullmq";
import logger from "../logs/helpers/logger";
import {redisBullConfig} from "../config/redis_config";

const toggleLikeQueue = new Queue("toggleLikeQueue", { connection: redisBullConfig });

toggleLikeQueue.on("error", (err: Error) => {
    logger.error("Bull Queue error:", err, {
        metadata: {
            timestamp: new Date().toISOString(),
            error: err.message,
        },
    });
});

export default toggleLikeQueue;
