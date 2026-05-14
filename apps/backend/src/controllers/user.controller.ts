import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";
import toNumber from "../utils/toNumber";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ success: false, message: "Name is required" });
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const user = await prisma.user.create({
    data: { name: name.trim(), email: email.trim() },
  });

  res.status(201).json({ success: true, data: user });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { projects: true },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({ success: true, results: users.length, data: users });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { projects: { include: { tasks: true } } },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.status(200).json({ success: true, data: user });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);
  const { name, email } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return res.status(400).json({ success: false, message: "Name cannot be empty" });
  }

  if (email !== undefined && (typeof email !== "string" || !email.trim())) {
    return res.status(400).json({ success: false, message: "Email cannot be empty" });
  }

  const userExists = await prisma.user.findUnique({ where: { id } });

  if (!userExists) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const data: { name?: string; email?: string } = {};
  if (name !== undefined) data.name = name.trim();
  if (email !== undefined) data.email = email.trim();

  const user = await prisma.user.update({ where: { id }, data });

  res.status(200).json({ success: true, data: user });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }

  const userExists = await prisma.user.findUnique({ where: { id } });

  if (!userExists) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  await prisma.user.delete({ where: { id } });

  res.status(200).json({ success: true, message: "User deleted successfully" });
});
