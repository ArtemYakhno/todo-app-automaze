import type { z } from "zod";
import type {
  createTaskFormSchema,
  createTaskSchema,
  taskFilterSchema,
  taskSchema,
  taskSortBySchema,
  taskSortOrderSchema,
  taskStatusSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "@/schemas/task.schema";

// Schema-first: all types are inferred from Zod schemas via z.infer, never hand-duplicated.
export type Task = z.infer<typeof taskSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskFilter = z.infer<typeof taskFilterSchema>;
export type TaskSortBy = z.infer<typeof taskSortBySchema>;
export type TaskSortOrder = z.infer<typeof taskSortOrderSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
