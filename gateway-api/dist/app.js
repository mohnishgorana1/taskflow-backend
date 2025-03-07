"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_http_proxy_1 = __importDefault(require("express-http-proxy"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests, please try again later.",
});
app.use(limiter);
const forwardAuthHeaders = (req, res, next) => {
    console.log("fun runs");
    console.log("Requested ORIGINAL URL:", req.originalUrl);
    console.log("Requested req.url:", req.url);
    if (req.headers.authorization) {
        console.log("Forward auth header");
        req.headers["Authorization"] = req.headers.authorization;
    }
    next();
};
// Proxy configuration
const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5001";
const taskServiceUrl = process.env.TASK_SERVICE_URL || "http://localhost:5002";
// Proxy requests to User Service for authentication and user-related endpoints
app.use("/api/v1/auth", forwardAuthHeaders, (0, express_http_proxy_1.default)(userServiceUrl, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
}));
app.use("/api/v1/users", forwardAuthHeaders, (0, express_http_proxy_1.default)(userServiceUrl, {
    proxyReqPathResolver: (req) => `/api/v1/users${req.url}`,
}));
// Proxy requests to Task Service for task and project related endpoints
app.use("/api/v1/task", forwardAuthHeaders, (0, express_http_proxy_1.default)(taskServiceUrl, {
    proxyReqPathResolver: (req) => `/api/v1/task${req.url}`,
}));
app.use("/api/v1/project", forwardAuthHeaders, (0, express_http_proxy_1.default)(taskServiceUrl, {
    proxyReqPathResolver: (req) => `/api/v1/project${req.url}`,
}));
exports.default = app;
