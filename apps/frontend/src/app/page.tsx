import { Suspense } from "react";
import { TasksView } from "@/features/tasks/TasksView";
import { TaskListSkeleton } from "@/features/tasks/TaskListSkeleton";
import { CreateTaskDialog } from "@/features/tasks/blocks/dialogs/CreateTaskDialog";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">My tasks</h1>
        <CreateTaskDialog />
      </header>

      <Suspense fallback={<TaskListSkeleton />}>
        <TasksView />
      </Suspense>
    </main>
  );
}
