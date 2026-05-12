import { Request, Response } from "express";
import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";

const toNumber = (value: string | string[] | undefined) => {
  if (typeof value !== "string") return Number.NaN;

  return Number(value);
};

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
  });

  res.status(201).json({
    success: true,
    data: user,
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      projects: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          tasks: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);
  const { name, email } = req.body;

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = toNumber(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user id",
    });
  }

  const userExists = await prisma.user.findUnique({
    where: { id },
  });

  if (!userExists) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await prisma.user.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
