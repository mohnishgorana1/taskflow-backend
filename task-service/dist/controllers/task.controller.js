"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.getSingleTaskDetails = exports.commentTask = exports.assignUsersToTask = exports.getTasksByProject = exports.createTask = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const task_model_1 = __importDefault(require("../models/task.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const axios_1 = __importDefault(require("axios"));
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { title, description, priority, labels } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { projectId } = req.params;
    console.log("req data", title, description, priority, labels, projectId, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!title || !priority || !labels) {
        res.status(400).json({
            success: false,
            message: "Missing Request Data",
        });
        return;
    }
    // Ensure labels is an array (default to empty array if undefined)
    const processedLabels = Array.isArray(labels) ? labels : [];
    try {
        // find  project
        const project = yield project_model_1.default.findById(projectId);
        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found",
            });
            return;
        }
        const newTask = yield task_model_1.default.create({
            title,
            description,
            priority,
            labels: processedLabels,
            projectId,
            createdBy: userId,
        });
        if (!newTask) {
            res.status(404).json({
                success: false,
                message: "Task not created",
            });
            return;
        }
        console.log("new task", newTask);
        // update project having this task
        (_b = project.tasks) === null || _b === void 0 ? void 0 : _b.push(newTask._id);
        yield project.save();
        res.status(201).json({
            success: true,
            message: "Task Added to Project Successfully",
            task: newTask,
        });
    }
    catch (error) {
        console.log("ERROR in Creating New Task: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.createTask = createTask;
const getTasksByProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { projectId } = req.params;
    console.log("req data", projectId, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!projectId) {
        res.status(400).json({
            success: false,
            message: "Missing Project Id",
        });
        return;
    }
    try {
        const tasks = yield task_model_1.default.aggregate([
            {
                $match: {
                    projectId: new mongoose_1.default.Types.ObjectId(String(projectId)),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "assignedUsers",
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comments",
                    foreignField: "_id",
                    as: "taskComments",
                },
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    priority: 1,
                    status: 1,
                    dueDate: 1,
                    assignedUsers: { _id: 1, name: 1, email: 1, profilePicture: 1 },
                    projectId: 1,
                    createdBy: 1,
                    subtasks: 1,
                    attachments: 1,
                    labels: 1,
                    taskComments: { _id: 1, text: 1, createdBy: 1, createdAt: 1 },
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        res.status(201).json({
            success: true,
            message: "Tasks fetched for requested Project Successfully",
            tasks,
        });
    }
    catch (error) {
        console.log("ERROR in Fetching Tasks: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getTasksByProject = getTasksByProject;
const assignUsersToTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { taskId } = req.params;
    const { email } = req.body;
    console.log("req data", taskId, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!taskId) {
        res.status(400).json({
            success: false,
            message: "Missing Task Id",
        });
        return;
    }
    if (!email) {
        res.status(400).json({
            success: false,
            message: "Cannot get you email to assign!",
        });
        return;
    }
    try {
        const task = yield task_model_1.default.findById(taskId);
        if (!task) {
            res.status(400).json({
                success: false,
                message: "Task Not Found",
            });
            return;
        }
        const taskCreatedBy = String(task === null || task === void 0 ? void 0 : task.createdBy);
        if (String(userId) !== taskCreatedBy) {
            res.status(400).json({
                success: false,
                message: "Unauthorized Way to Assign!, Only User who created Task can assign different Users ",
            });
            return;
        }
        // Call the User Service GET `/` route for fteching user details form that email
        const response = yield axios_1.default.post(`${process.env.USER_SERVICE_URL}`, {
            emails: [email],
        });
        if (!response.data.success) {
            res.status(400).json({
                success: false,
                message: "Can't find registerd user for that email",
            });
            return;
        }
        const userData = response.data.users[0];
        const isUserAlreadyAsssigned = task.assignedTo.includes(userData._id);
        if (isUserAlreadyAsssigned) {
            res.status(401).json({
                success: false,
                message: "User with that email already assigned to given task!",
            });
        }
        // okay so now assign the requested user
        task.assignedTo.push(userData._id);
        yield task.save();
        console.log("task", task);
        const assignedUserIds = task.assignedTo;
        const fetchUsersResponse = yield axios_1.default.post(`${process.env.USER_SERVICE_URL}/fetch-users`, { userIds: assignedUserIds });
        if (!fetchUsersResponse.data.success) {
            res.status(400).json({
                success: false,
                message: "Failed to fetch assigned users",
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Reqeusted User Assigned to Project Successfully",
            task: Object.assign(Object.assign({}, task.toObject()), { assignedUsers: fetchUsersResponse.data.users }),
        });
    }
    catch (error) {
        console.log("ERROR in Fetching Tasks: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.assignUsersToTask = assignUsersToTask;
const commentTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { comment } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { taskId } = req.params;
    console.log("req data for comment", comment, taskId, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!comment) {
        res.status(400).json({
            success: false,
            message: "Missing Comment Data in request",
        });
        return;
    }
    if (!taskId) {
        res.status(400).json({
            success: false,
            message: "Missing TaskId in params",
        });
        return;
    }
    try {
        // find  task
        const task = yield task_model_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({
                success: false,
                message: "Task not found for commenting",
            });
            return;
        }
        const newComment = yield comment_model_1.default.create({
            taskId,
            userId,
            message: comment,
        });
        if (!newComment) {
            res.status(404).json({
                success: false,
                message: "Comment not created in DB",
            });
            return;
        }
        console.log("new comment", newComment);
        // update task having this comment
        (_b = task === null || task === void 0 ? void 0 : task.comments) === null || _b === void 0 ? void 0 : _b.push(newComment._id);
        yield task.save();
        res.status(201).json({
            success: true,
            message: "Comment Added to Task Successfully",
            comment: newComment,
        });
    }
    catch (error) {
        console.log("ERROR in adding new Comment: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.commentTask = commentTask;
const getSingleTaskDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { taskId } = req.params;
    console.log("req data for getting task details", taskId, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!taskId) {
        res.status(400).json({
            success: false,
            message: "Missing TaskId in params",
        });
        return;
    }
    try {
        // find  task details
        const task = yield task_model_1.default.findById(taskId).populate("comments");
        if (!task) {
            res.status(404).json({
                success: false,
                message: "Task not found",
            });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Task details fetched Successfully",
            task: task,
        });
    }
    catch (error) {
        console.log("ERROR in fetching task details: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.getSingleTaskDetails = getSingleTaskDetails;
const updateTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        if (!taskId) {
            res.status(400).json({
                success: false,
                message: "Invalid Task ID",
            });
            return;
        }
        const allowedUpdates = [
            "title",
            "description",
            "priority",
            "status",
            "dueDate",
            "labels",
        ];
        const updateFields = {};
        // ignoring undefined fields
        for (const key of allowedUpdates) {
            if (updates[key] !== undefined) {
                updateFields[key] = updates[key];
            }
        }
        if (Object.keys(updateFields).length === 0) {
            res.status(400).json({
                success: false,
                message: "No valid fields provided for update",
            });
            return;
        }
        // Update only the provided fields, keeping existing values for others
        const updatedTask = yield task_model_1.default.findByIdAndUpdate(taskId, { $set: updateFields }, { new: true } // Returns updated document
        );
        if (!updatedTask) {
            res.status(404).json({
                success: false,
                message: "Task not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: updatedTask,
        });
        return;
    }
    catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
        return;
    }
});
exports.updateTask = updateTask;
