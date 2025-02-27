import Project from "../models/project.model";
import Task from "../models/task.model";
import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import mongoose from "mongoose";
import axios from "axios";

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { title, description, priority, labels } = req.body;
  const userId = req.user?._id;
  const { projectId } = req.params;

  console.log(
    "req data",
    title,
    description,
    priority,
    labels,
    projectId,
    userId
  );

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
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }
    const newTask: any = await Task.create({
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
    project.tasks?.push(newTask._id);
    await project.save();

    res.status(201).json({
      success: true,
      message: "Task Added to Project Successfully",
      task: newTask,
    });
  } catch (error) {
    console.log("ERROR in Creating New Task: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const getTasksByProject = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;
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
    const tasks = await Task.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(String(projectId)),
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
  } catch (error) {
    console.log("ERROR in Fetching Tasks: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const assignUsersToTask = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?._id;
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
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(400).json({
        success: false,
        message: "Task Not Found",
      });
      return;
    }

    const taskCreatedBy = String(task?.createdBy);
    if (String(userId) !== taskCreatedBy) {
      res.status(400).json({
        success: false,
        message:
          "Unauthorized Way to Assign!, Only User who created Task can assign different Users ",
      });
      return;
    }

    // Call the User Service GET `/` route for fteching user details form that email
    const response = await axios.get(
      `${process.env.USER_SERVICE_URL}/${email}`
    );
    if (!response.data.success) {
      res.status(400).json({
        success: false,
        message: "Can't find registerd user for that email",
      });
      return;
    }

    const userData = response.data.user;

    const isUserAlreadyAsssigned = task.assignedTo.includes(userData._id);
    if (isUserAlreadyAsssigned) {
      res.status(401).json({
        success: false,
        message: "User with that email already assigned to given task!",
      });
    }

    // okay so now assign the requested user
    task.assignedTo.push(userData._id);
    await task.save();
    console.log("task", task);

    const assignedUserIds = task.assignedTo;
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

    res.status(201).json({
      success: true,
      message: "Reqeusted User Assigned to Project Successfully",
      task: {
        ...task.toObject(),
        assignedUsers: fetchUsersResponse.data.users,
      },
    });
  } catch (error) {
    console.log("ERROR in Fetching Tasks: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : error,
    });
  }
};
