import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
// import connectDB from "./config/db";
// import authRoutes from "./routes/auth.routes";
// import userRoutes from "./routes/user.routes";

dotenv.config();
// connectDB();

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

// Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

export default app;
