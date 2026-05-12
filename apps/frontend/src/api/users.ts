import client from "./client";
import type {
  User,
  ApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "../types";

export const getUsers = async (): Promise<User[]> => {
  const res = await client.get<ApiResponse<User[]>>("/users");
  return res.data.data ?? [];
};

export const getUser = async (id: number): Promise<User> => {
  const res = await client.get<ApiResponse<User>>(`/users/${id}`);
  return res.data.data!;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const res = await client.post<ApiResponse<User>>("/users", payload);
  return res.data.data!;
};

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<User> => {
  const res = await client.patch<ApiResponse<User>>(`/users/${id}`, payload);
  return res.data.data!;
};

export const deleteUser = async (id: number): Promise<void> => {
  await client.delete(`/users/${id}`);
};
