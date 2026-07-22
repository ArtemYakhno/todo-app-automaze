"use client";

import { Button } from "@/components/ui/button";
import { useTasksQuery } from "@/queries/tasks/useTasksQuery";
import type { TaskQueryParams } from "@/types/task";
import { TaskItem } from "./TaskItem";
import { TaskListSkeleton } from "./TaskListSkeleton";

function hasActiveFilters(params: TaskQueryParams): boolean {
  return Boolean(
    (params.filter && params.filter !== "all") || params.status || params.query,
  );
}

export function TaskList({ params = {} }: { params?: TaskQueryParams }) {
  const { data, isPending, isError, refetch } = useTasksQuery(params);

  if (isPending) {
    return <TaskListSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load tasks</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        {hasActiveFilters(params)
          ? "No tasks match your filters"
          : "No tasks yet"}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ul>
  );
}
