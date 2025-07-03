import { Queue } from "bullmq";
import {redisBullConfig} from "../config/redis_config";

export const notificationQueue = new Queue("notifications", {
    connection: redisBullConfig,
});

notificationQueue.on("error", (err: Error) => {
    console.error("Bull Queue error:", err, {
        metadata: {
            timestamp: new Date().toISOString(),
            error: err.message,
        },
    });
});
