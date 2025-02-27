import express from "express";
import {
  createProject,
  getProjects,
  getProjectDetailsById,
  updateProject,
  deleteProject,
  addTeamMembers,
} from "../controllers/project.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getProjects);
router.get("/:id", authMiddleware, getProjectDetailsById);
router.patch("/:id", authMiddleware, updateProject);
router.delete("/:id", authMiddleware, deleteProject);
router.patch("/:id/team", authMiddleware, addTeamMembers);

export default router;
