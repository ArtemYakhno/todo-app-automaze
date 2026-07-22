import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/api/tasks";
import type { TaskQueryParams } from "@/types/task";
import { taskKeys } from "./taskKeys";

export function useTasksQuery(params: TaskQueryParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ signal }) => getTasks(params, signal),
  });
}
