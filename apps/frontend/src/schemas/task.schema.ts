import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const taskFilterSchema = z.enum(["all", "done", "undone"]);
export const taskSortBySchema = z.enum(["priority", "dueDate", "createdAt"]);
export const taskSortOrderSchema = z.enum(["asc", "desc"]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.number().int().min(1).max(10),
  tags: z.array(z.string()),
  dueDate: z.string().nullable(),
  status: taskStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(30, "Title must be at most 30 characters"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  priority: z
    .number({ error: "Priority is required" })
    .int("Priority must be a whole number")
    .min(1, "Priority must be between 1 and 10")
    .max(10, "Priority must be between 1 and 10"),
  tags: z.array(z.string()).max(5, "You can add at most 5 tags").optional(),
  dueDate: z.string().optional(),
});


export const updateTaskSchema = createTaskSchema.partial();

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}


export const createTaskFormSchema = createTaskSchema.refine(
  (values) => !values.dueDate || new Date(values.dueDate) >= startOfToday(),
  { path: ["dueDate"], message: "Due date can't be in the past" },
);

export const taskQuerySchema = z.object({
  filter: taskFilterSchema.optional().catch(undefined),
  status: taskStatusSchema.optional().catch(undefined),
  sortBy: taskSortBySchema.optional().catch(undefined),
  sortOrder: taskSortOrderSchema.optional().catch(undefined),
  query: z.string().optional().catch(undefined),
});
