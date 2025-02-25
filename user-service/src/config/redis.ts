import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

redisClient.connect()
    .then(() => console.log("✅ Connected to Redis"))
    .catch((err) => console.error("❌ Redis Connection Failed:", err));

export { redisClient };
