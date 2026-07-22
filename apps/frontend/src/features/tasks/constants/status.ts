import type { TaskStatus } from "@/types/task";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
