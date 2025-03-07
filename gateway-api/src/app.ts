import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createProxyMiddleware, RequestHandler } from "http-proxy-middleware";
import expressProxy from "express-http-proxy";
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

const forwardAuthHeaders = (req: any, res: any, next: any) => {
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
const userServiceUrl = process.env.USER_SERVICE_URL || "https://taskflow-gwps.onrender.com";
const taskServiceUrl = process.env.TASK_SERVICE_URL || "https://taskflow-task-service.onrender.com";

// Proxy requests to User Service for authentication and user-related endpoints
app.use(
  "/api/v1/auth",
  forwardAuthHeaders,
  expressProxy(userServiceUrl, {s
    proxyReqPathResolver: (req: any) => `/api/v1/auth${req.url}`,
  })
);

app.use(
  "/api/v1/users",
  forwardAuthHeaders,
  expressProxy(userServiceUrl, {
    proxyReqPathResolver: (req: any) => `/api/v1/users${req.url}`,
  })
);

// Proxy requests to Task Service for task and project related endpoints
app.use(
  "/api/v1/task",
  forwardAuthHeaders,
  expressProxy(taskServiceUrl, {
    proxyReqPathResolver: (req: any) => `/api/v1/task${req.url}`,
  })
);

app.use(
  "/api/v1/project",
  forwardAuthHeaders,
  expressProxy(taskServiceUrl, {
    proxyReqPathResolver: (req: any) => `/api/v1/project${req.url}`,
  })
);

export default app;
