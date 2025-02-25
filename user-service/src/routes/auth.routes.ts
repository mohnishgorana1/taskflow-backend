import express from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
