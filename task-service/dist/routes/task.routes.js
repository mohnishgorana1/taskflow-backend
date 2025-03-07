"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const task_controller_1 = require("../controllers/task.controller");
const router = express_1.default.Router();
router.post("/:projectId/", auth_middleware_1.authMiddleware, task_controller_1.createTask);
router.get("/:projectId/", auth_middleware_1.authMiddleware, task_controller_1.getTasksByProject);
router.get("/:taskId/info", auth_middleware_1.authMiddleware, task_controller_1.getSingleTaskDetails);
router.put("/:taskId/assign", auth_middleware_1.authMiddleware, task_controller_1.assignUsersToTask);
router.post("/:taskId/comment", auth_middleware_1.authMiddleware, task_controller_1.commentTask);
router.patch("/:taskId/update", auth_middleware_1.authMiddleware, task_controller_1.updateTask);
exports.default = router;
