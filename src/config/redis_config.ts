import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "../logs/helpers/logger";

dotenv.config();

const redis_client = new Redis({
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT) || 6379,
});

redis_client.on("error", (err: Error) => {
    logger.error("Redis error:", err, {
        metadata: {
            timestamp: new Date().toISOString(),
            error: err.message,
        },
    });
});

// Gracefully handle process termination
process.on("SIGINT", () => {
    redis_client.quit().then(() => {
        process.exit(0);
    });
});

const redisBullConfig = {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT) || 6379,
};

export { redis_client , redisBullConfig};
