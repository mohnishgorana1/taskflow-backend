import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createTask,
  getTasksByProject,
  assignUsersToTask,
  commentTask,
  getSingleTaskDetails,
  updateTask
} from "../controllers/task.controller";
const router = express.Router();

router.post("/:projectId/", authMiddleware, createTask);  
router.get("/:projectId/", authMiddleware, getTasksByProject);

router.get("/:taskId/info", authMiddleware, getSingleTaskDetails);
router.put("/:taskId/assign", authMiddleware, assignUsersToTask);
router.post("/:taskId/comment", authMiddleware, commentTask);
router.patch("/:taskId/update", authMiddleware, updateTask)

export default router;
