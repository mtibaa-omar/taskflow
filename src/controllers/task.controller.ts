import { Request, Response } from "express";
import { TaskStatus } from "../../generated/prisma/enums";
import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";

const toNumber = (value: string | string[] | undefined) => {
  if (typeof value !== "string") return Number.NaN;

  return Number(value);
};

const allowedStatuses = Object.values(TaskStatus);

const parseTaskStatus = (value: unknown): TaskStatus | undefined => {
  if (typeof value !== "string") return undefined;

  return allowedStatuses.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : undefined;
};

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { title, description, status, projectId } = req.body;

  const numericProjectId = Number(projectId);
  const taskStatus = parseTaskStatus(status);

  if (Number.isNaN(numericProjectId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid projectId",
    });
  }

  if (status && !taskStatus) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  const project = await prisma.project.findUnique({
    where: {
      id: numericProjectId,
    },
  });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: taskStatus,
      projectId: numericProjectId,
    },
    include: {
      project: true,
    },
  });

  res.status(201).json({
    success: true,
    data: task,
  });
});

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const { status, projectId } = req.query;
  const taskStatus = parseTaskStatus(status);
  const numericProjectId =
    projectId === undefined
      ? undefined
      : typeof projectId === "string"
        ? Number(projectId)
        : Number.NaN;

  if (status && !taskStatus) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  if (projectId && Number.isNaN(numericProjectId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid projectId",
    });
  }

  const tasks = await prisma.task.findMany({
    where: {
      status: taskStatus,
      projectId: numericProjectId,
    },
    include: {
      project: {
        include: {
          owner: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    results: tasks.length,
    data: tasks,
  });
});

export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          owner: true,
        },
      },
    },
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);
  const { title, description, status } = req.body;
  const taskStatus = parseTaskStatus(status);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  if (status && !taskStatus) {
    return res.status(400).json({
      success: false,
      message: "Invalid task status",
    });
  }

  const taskExists = await prisma.task.findUnique({
    where: { id },
  });

  if (!taskExists) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      status: taskStatus,
    },
    include: {
      project: true,
    },
  });

  res.status(200).json({
    success: true,
    data: task,
  });
});

export const updateTaskStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = toNumber(req.params.id);
    const { status } = req.body;
    const taskStatus = parseTaskStatus(status);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task id",
      });
    }

    if (!taskStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const taskExists = await prisma.task.findUnique({
      where: { id },
    });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        status: taskStatus,
      },
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  },
);

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid task id",
    });
  }

  const taskExists = await prisma.task.findUnique({
    where: { id },
  });

  if (!taskExists) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  await prisma.task.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
