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
exports.deleteProject = exports.updateProject = exports.leaveProject = exports.getMyProjects = exports.addTeamMembers = exports.getProjectDetailsById = exports.getProjects = exports.createProject = void 0;
const project_model_1 = __importDefault(require("../models/project.model"));
const axios_1 = __importDefault(require("axios"));
const createProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { title, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log("req data", title, description, userId);
    if (!userId) {
        res.status(401).json({
            success: false,
            message: "Unauthorized: User not found",
        });
        return;
    }
    if (!title || !description) {
        res.status(400).json({
            success: false,
            message: "Missing Request Data",
        });
        return;
    }
    try {
        // create new project
        const newProject = yield project_model_1.default.create({
            title,
            description,
            projectAdmin: userId,
        });
        console.log("new project", newProject);
        res.status(201).json({
            success: true,
            message: "Project Created Successfully",
            project: newProject,
        });
    }
    catch (error) {
        console.log("ERROR in Creating New Project: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.createProject = createProject;
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            success: false,
            message: "",
        });
    }
});
exports.getProjects = getProjects;
const getProjectDetailsById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const { projectId } = req.params;
        if (!projectId) {
            return res.status(401).json({
                success: false,
                message: "Invalid Project Id",
            });
        }
        const project = yield project_model_1.default.findById(projectId).populate({
            path: "tasks",
            populate: {
                path: "comments",
            },
        });
        if (!project) {
            return res.status(500).json({
                success: false,
                message: "Can't get project",
            });
        }
        // Extract Unique User IDs: Collect all user IDs from assignedTo[] across tasks.
        const assignedUserIds = [
            ...new Set(project.tasks.flatMap((task) => task.assignedTo.map((id) => id.toString()))),
        ];
        console.log("uniques assigned userIDs", assignedUserIds);
        if (assignedUserIds.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Project Details Fetched",
                project,
            });
        }
        // fetch users
        const fetchUsersResponse = yield axios_1.default.post(`${process.env.USER_SERVICE_URL}/fetch-users`, { userIds: assignedUserIds });
        if (!fetchUsersResponse.data.success) {
            res.status(400).json({
                success: false,
                message: "Failed to fetch assigned users",
            });
            return;
        }
        const users = fetchUsersResponse.data.users;
        // map users to their respective IDs
        const userMap = new Map(users.map((user) => [user._id, user]));
        // replace assignedTo[] with user objects
        const updatedTasks = project.tasks.map((task) => (Object.assign(Object.assign({}, task.toObject()), { assignedTo: task.assignedTo.map((userId) => userMap.get(userId.toString())) })));
        console.log("updated TASKS", updatedTasks);
        // Attach updated tasks back to project
        const updatedProject = Object.assign(Object.assign({}, project.toObject()), { tasks: updatedTasks });
        return res.status(201).json({
            success: true,
            message: "Project Details Fetched",
            project: updatedProject,
        });
        // find project details
    }
    catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.getProjectDetailsById = getProjectDetailsById;
const addTeamMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { emails } = req.body;
    if (!projectId) {
        return res.status(401).json({
            success: false,
            message: "Invalid Project Id",
        });
    }
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized!, Can't get your details",
        });
    }
    const processedEmails = Array.isArray(emails) ? emails : [];
    if (!processedEmails) {
        return res.status(401).json({
            success: false,
            message: "Empty Email List from client side",
        });
    }
    try {
        const project = yield project_model_1.default.findById(projectId);
        if (!project) {
            return res.status(401).json({
                success: false,
                message: "Can't Find project",
            });
        }
        if (String(project.projectAdmin) !== String(userId)) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!. Only Project Admin can add members to project",
            });
        }
        // Call the User Service GET `/` route for fteching user details form that email
        const { data } = yield axios_1.default.post(`${process.env.USER_SERVICE_URL}`, {
            emails,
        });
        if (!data.success) {
            res.status(400).json({
                success: false,
                message: "Can't find registerd users from these emails",
            });
            return;
        }
        const users = data.users;
        const newUserIds = users.map((user) => user._id.toString());
        // ensure only unique userIds are added
        const uniqueTeamMembers = [
            ...new Set([
                ...project === null || project === void 0 ? void 0 : project.teamMembers.map((id) => id.toString()),
                ...newUserIds,
            ]),
        ];
        // Update project teamMembers
        project.teamMembers = uniqueTeamMembers;
        yield project.save();
        return res.status(201).json({
            success: true,
            message: "Team Members added successfully",
            teamMembers: project.teamMembers,
        });
    }
    catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error,
        });
    }
});
exports.addTeamMembers = addTeamMembers;
const getMyProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!, Can't get your details",
            });
        }
        //* Basic Approach
        // const projectsAsAdmin = await Project.find({ projectAdmin: userId });
        // const projectsAsTeamMemer = await Project.find({
        //   teamMembers: userId,
        //   projectAdmin: { $ne: userId },
        // });
        //* Optimised Approach
        const projects = yield project_model_1.default.find({
            $or: [{ projectAdmin: userId }, { teamMembers: userId }],
        });
        const segregatedProjects = {
            asAdmin: projects.filter((p) => String(p.projectAdmin) === String(userId)),
            asTeamMember: projects.filter((p) => String(p.projectAdmin) !== String(userId)),
        };
        return res.status(201).json({
            success: true,
            message: "Projects fetched successfully",
            projects: segregatedProjects,
        });
    }
    catch (error) {
        console.log("ERROR", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
});
exports.getMyProjects = getMyProjects;
const leaveProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // leave project by team member
    try {
        const { projectId } = req.params;
        const userId = req === null || req === void 0 ? void 0 : req.user._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!, Can't get your details",
            });
        }
        if (!projectId) {
            return res.status(401).json({
                success: false,
                message: "Can't get your project Id",
            });
        }
        const project = yield project_model_1.default.findById(projectId);
        if (!project) {
            return res.status(401).json({
                success: false,
                message: "Can't find project!",
            });
        }
        if (String(project.projectAdmin) === String(userId)) {
            return res.status(500).json({
                success: false,
                message: "Project Admin can't just leave the project. Transfer admin rights first.",
            });
        }
        if (!((_a = project.teamMembers) === null || _a === void 0 ? void 0 : _a.includes(userId))) {
            return res.status(500).json({
                success: false,
                message: "You are not a member of this project",
            });
        }
        project.teamMembers = project.teamMembers.filter((member) => String(member) !== String(userId));
        yield project.save();
        return res.status(200).json({
            success: true,
            message: "Successfully left the project",
        });
    }
    catch (error) {
        console.log("ERROR delete project", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.leaveProject = leaveProject;
// TODO
const updateProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log("ERROR update project", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.updateProject = updateProject;
// TODO
const deleteProject = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        console.log("ERROR delete project", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : error,
        });
    }
});
exports.deleteProject = deleteProject;
