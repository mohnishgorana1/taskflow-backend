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

router.post("/", authMiddleware, createProject); // done
router.get("/", authMiddleware, getProjects);  
router.get("/:projectId", authMiddleware, getProjectDetailsById); // done
router.patch("/:projectId", authMiddleware, updateProject);
router.delete("/:projectId", authMiddleware, deleteProject);
router.patch("/:projectId/team", authMiddleware, addTeamMembers);  // done

export default router;
