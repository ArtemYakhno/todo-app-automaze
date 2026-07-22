import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/api/tasks";
import { taskKeys } from "./taskKeys";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
