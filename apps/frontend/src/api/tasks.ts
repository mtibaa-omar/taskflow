import client from "./client";
import type {
  Task,
  TaskStatus,
  ApiResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
} from "../types";

export const getTasks = async (filters?: {
  projectId?: number;
  status?: TaskStatus;
}): Promise<Task[]> => {
  const res = await client.get<ApiResponse<Task[]>>("/tasks", {
    params: filters,
  });
  return res.data.data ?? [];
};

export const getTask = async (id: number): Promise<Task> => {
  const res = await client.get<ApiResponse<Task>>(`/tasks/${id}`);
  return res.data.data!;
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const res = await client.post<ApiResponse<Task>>("/tasks", payload);
  return res.data.data!;
};

export const updateTask = async (
  id: number,
  payload: UpdateTaskPayload
): Promise<Task> => {
  const res = await client.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
  return res.data.data!;
};

export const updateTaskStatus = async (
  id: number,
  status: TaskStatus
): Promise<Task> => {
  const res = await client.patch<ApiResponse<Task>>(`/tasks/${id}/status`, {
    status,
  });
  return res.data.data!;
};

export const deleteTask = async (id: number): Promise<void> => {
  await client.delete(`/tasks/${id}`);
};
