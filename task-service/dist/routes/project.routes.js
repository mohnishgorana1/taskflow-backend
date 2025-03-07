"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.authMiddleware, project_controller_1.createProject); // done
router.get("/", auth_middleware_1.authMiddleware, project_controller_1.getProjects);
router.get("/my-projects", auth_middleware_1.authMiddleware, project_controller_1.getMyProjects); //done
router.get("/:projectId", auth_middleware_1.authMiddleware, project_controller_1.getProjectDetailsById); // done
router.patch("/:projectId", auth_middleware_1.authMiddleware, project_controller_1.updateProject);
router.delete("/:projectId", auth_middleware_1.authMiddleware, project_controller_1.deleteProject);
router.patch("/:projectId/team", auth_middleware_1.authMiddleware, project_controller_1.addTeamMembers); // done
router.delete("/:projectId/leave", auth_middleware_1.authMiddleware, project_controller_1.leaveProject); //done
exports.default = router;
