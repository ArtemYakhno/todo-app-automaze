import type { TaskQueryParams } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (params: TaskQueryParams) => [...taskKeys.all, "list", params] as const,
};
