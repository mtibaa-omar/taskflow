export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
}

export interface Project {
  id: number;
  title: string;
  description?: string | null;
  ownerId: number;
  owner?: User;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  projectId: number;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  results?: number;
  message?: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  ownerId: number;
}

export interface UpdateProjectPayload {
  title?: string;
  description?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  projectId: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
