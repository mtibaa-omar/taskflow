import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import toNumber from "../utils/toNumber";

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const { title, description, ownerId } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }

  const numericOwnerId = Number(ownerId);

  if (Number.isNaN(numericOwnerId)) {
    return res.status(400).json({ success: false, message: "Invalid ownerId" });
  }

  const owner = await prisma.user.findUnique({ where: { id: numericOwnerId } });

  if (!owner) {
    return res.status(404).json({ success: false, message: "Owner user not found" });
  }

  const project = await prisma.project.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      ownerId: numericOwnerId,
    },
    include: { owner: true, tasks: true },
  });

  res.status(201).json({ success: true, data: project });
});

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
    include: { owner: true, tasks: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, results: projects.length, data: projects });
});

export const getProjectById = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid project id" });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { owner: true, tasks: true },
  });

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  res.status(200).json({ success: true, data: project });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);
  const { title, description } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid project id" });
  }

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ success: false, message: "Title cannot be empty" });
  }

  const projectExists = await prisma.project.findUnique({ where: { id } });

  if (!projectExists) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  const data: { title?: string; description?: string | null } = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;

  const project = await prisma.project.update({
    where: { id },
    data,
    include: { owner: true, tasks: true },
  });

  res.status(200).json({ success: true, data: project });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid project id" });
  }

  const projectExists = await prisma.project.findUnique({ where: { id } });

  if (!projectExists) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  await prisma.project.delete({ where: { id } });

  res.status(200).json({ success: true, message: "Project deleted successfully" });
});
