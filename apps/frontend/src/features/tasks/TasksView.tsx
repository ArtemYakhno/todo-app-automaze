"use client";

import { TaskFilters } from "./TaskFilters";
import { TaskList } from "./TaskList";
import { useTaskFilters } from "./hooks/useTaskFilters";

export function TasksView() {
  const { params, updateParams } = useTaskFilters();

  return (
    <>
      <TaskFilters params={params} updateParams={updateParams} />
      <TaskList params={params} />
    </>
  );
}
