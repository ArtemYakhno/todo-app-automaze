import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTask } from "@/api/tasks";
import type { UpdateTaskInput } from "@/types/task";
import { taskKeys } from "./taskKeys";

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskInput }) =>
      updateTask(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
