import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskStatus } from "@/api/tasks";
import type { TaskStatus } from "@/types/task";
import { taskKeys } from "./taskKeys";

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
