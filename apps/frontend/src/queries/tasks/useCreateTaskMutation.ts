import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/api/tasks";
import { taskKeys } from "./taskKeys";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
