"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTaskStatusMutation } from "@/queries/tasks/useUpdateTaskStatusMutation";
import type { TaskStatus } from "@/types/task";
import { STATUS_LABEL, STATUS_ORDER } from "../../constants/status";

interface TaskStatusSelectProps {
  taskId: string;
  status: TaskStatus;
}

export function TaskStatusSelect({ taskId, status }: TaskStatusSelectProps) {
  const mutation = useUpdateTaskStatusMutation();

  return (
    <Select
      value={status}
      disabled={mutation.isPending}
      onValueChange={(value) =>
        mutation.mutate({ id: taskId, status: value as TaskStatus })
      }
    >
      <SelectTrigger size="sm" className="w-32" aria-label="Task status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((value) => (
          <SelectItem key={value} value={value}>
            {STATUS_LABEL[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
