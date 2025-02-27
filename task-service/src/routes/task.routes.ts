import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createTask, getTasksByProject, assignUsersToTask } from "../controllers/task.controller";
const router = express.Router();

router.post("/:projectId/", authMiddleware, createTask);
router.get("/:projectId/", authMiddleware, getTasksByProject)
router.put("/:taskId/assign", authMiddleware, assignUsersToTask)
export default router;
