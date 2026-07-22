import { api } from "@/lib/apiClient";
import { toQueryString } from "@/lib/searchParams";
import type {
  CreateTaskInput,
  Task,
  TaskQueryParams,
  TaskStatus,
  UpdateTaskInput,
} from "@/types/task";

export function getTasks(
  params: TaskQueryParams = {},
  signal?: AbortSignal,
): Promise<Task[]> {
  const qs = toQueryString(params);
  return api.get<Task[]>(`/tasks${qs ? `?${qs}` : ""}`, signal);
}

export function createTask(dto: CreateTaskInput): Promise<Task> {
  return api.post<Task>("/tasks", dto);
}

export function updateTask(id: string, dto: UpdateTaskInput): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}`, dto);
}

export function deleteTask(id: string): Promise<void> {
  return api.delete(`/tasks/${id}`);
}

export function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}/status`, { status });
}
