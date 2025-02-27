import Project from "../models/project.model";
import Task from "../models/task.model";
import { Response } from "express";
import { AuthenticatedRequest } from "../types";

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
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "",
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
  try {
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({
      success: false,
      message: "",
    });
  }
};
