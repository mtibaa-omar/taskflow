import client from "./client";
import type {
  Project,
  ApiResponse,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "../types";

export const getProjects = async (): Promise<Project[]> => {
  const res = await client.get<ApiResponse<Project[]>>("/projects");
  return res.data.data ?? [];
};

export const getProject = async (id: number): Promise<Project> => {
  const res = await client.get<ApiResponse<Project>>(`/projects/${id}`);
  return res.data.data!;
};

export const createProject = async (
  payload: CreateProjectPayload
): Promise<Project> => {
  const res = await client.post<ApiResponse<Project>>("/projects", payload);
  return res.data.data!;
};

export const updateProject = async (
  id: number,
  payload: UpdateProjectPayload
): Promise<Project> => {
  const res = await client.patch<ApiResponse<Project>>(
    `/projects/${id}`,
    payload
  );
  return res.data.data!;
};

export const deleteProject = async (id: number): Promise<void> => {
  await client.delete(`/projects/${id}`);
};
