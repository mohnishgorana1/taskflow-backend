import Project from "../models/project.model";
import Task from "../models/task.model";
import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import mongoose from "mongoose";
import axios from "axios";

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { title, description } = req.body;
  const userId = req.user?._id;

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
    const newProject = await Project.create({
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
  } catch (error) {
    console.log("ERROR in Creating New Project: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getProjects = async (req: any, res: any) => {
  try {
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "",
    });
  }
};

export const getProjectDetailsById = async (req: any, res: any) => {
  try {
    const { userId } = req.user;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(401).json({
        success: false,
        message: "Invalid Project Id",
      });
    }

    const project: any = await Project.findById(projectId).populate({
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

    const assignedUserIds: any = [
      ...new Set(
        project.tasks.flatMap((task: any) =>
          task.assignedTo.map((id: any) => id.toString())
        )
      ),
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
    const fetchUsersResponse = await axios.post(
      `${process.env.USER_SERVICE_URL}/fetch-users`,
      { userIds: assignedUserIds }
    );
    if (!fetchUsersResponse.data.success) {
      res.status(400).json({
        success: false,
        message: "Failed to fetch assigned users",
      });
      return;
    }
    const users = fetchUsersResponse.data.users;

    // map users to their respective IDs
    const userMap = new Map(users.map((user: any) => [user._id, user]));

    // replace assignedTo[] with user objects
    const updatedTasks = project.tasks.map((task: any) => ({
      ...task.toObject(),
      assignedTo: task.assignedTo.map((userId: any) =>
        userMap.get(userId.toString())
      ),
    }));

    console.log("updated TASKS", updatedTasks);

    // Attach updated tasks back to project
    const updatedProject = {
      ...project.toObject(),
      tasks: updatedTasks,
    };
    return res.status(201).json({
      success: true,
      message: "Project Details Fetched",
      project: updatedProject,
    });

    // find project details
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProject = async (req: any, res: any) => {
  try {
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "",
    });
  }
};

export const deleteProject = async (req: any, res: any) => {
  try {
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "",
    });
  }
};

export const addTeamMembers = async (req: any, res: any) => {
  const { projectId } = req.params;
  const userId = req.user?._id;
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
    const project: any = await Project.findById(projectId);
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
    const { data } = await axios.post(`${process.env.USER_SERVICE_URL}`, {
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
    const newUserIds = users.map((user: any) => user._id.toString());

    // ensure only unique userIds are added
    const uniqueTeamMembers: any = [
      ...new Set([
        ...project?.teamMembers.map((id: any) => id.toString()),
        ...newUserIds,
      ]),
    ];

    // Update project teamMembers
    project.teamMembers = uniqueTeamMembers;
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Team Members added successfully",
      teamMembers: project.teamMembers,
    });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error,
    });
  }
};
