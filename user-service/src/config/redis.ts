import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000), // Retry strategy
    },
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

redisClient.connect()
    .then(() => console.log("✅ Connected to Redis"))
    .catch((err) => console.error("❌ Redis Connection Failed:", err));

export { redisClient };
