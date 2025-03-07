"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisUrl = process.env.REDIS_URL;
console.log("redis url", process.env.REDIS_URL);
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient = redisClient;
redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient
    .connect()
    .then(() => console.log("✅ Connected to Redis"))
    .catch((err) => console.error("❌ Redis Connection Failed:", err));
