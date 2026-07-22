import { CalendarDays, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDueDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { DeleteTaskButton } from "./blocks/components/DeleteTaskButton";
import { EditTaskDialog } from "./blocks/dialogs/EditTaskDialog";
import { TaskStatusSelect } from "./blocks/components/TaskStatusSelect";

function priorityTier(priority: number) {
  if (priority >= 8) return { accent: "border-l-rose-500", text: "text-rose-600" };
  if (priority >= 4) return { accent: "border-l-amber-500", text: "text-amber-600" };
  return { accent: "border-l-border", text: "text-muted-foreground" };
}

// Overdue = due day is strictly before today (local calendar day) and the task
// isn't done. Compared as day strings to stay timezone-safe: a task due "today"
// (stored as UTC midnight) must not read as overdue.
function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return task.dueDate.slice(0, 10) < today;
}

export function TaskItem({ task }: { task: Task }) {
  const isDone = task.status === "done";
  const tier = priorityTier(task.priority);
  const overdue = isOverdue(task);

  return (
    <div
      className={cn(
        "rounded-lg border border-l-4 bg-card p-4 shadow-sm transition-colors hover:bg-muted/40",
        tier.accent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "min-w-0 flex-1 leading-snug font-medium wrap-break-word",
            isDone && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </h3>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          <TaskStatusSelect taskId={task.id} status={task.status} />
          <EditTaskDialog task={task} />
          <DeleteTaskButton taskId={task.id} taskTitle={task.title} />
        </div>
      </div>

      {task.description && (
        <p className="mt-1 text-sm text-muted-foreground wrap-break-word">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className={cn("font-semibold", tier.text)}>P{task.priority}</span>
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1",
              overdue ? "font-medium text-destructive" : "text-muted-foreground",
            )}
          >
            {overdue ? (
              <TriangleAlert className="size-3.5" />
            ) : (
              <CalendarDays className="size-3.5" />
            )}
            {overdue
              ? `Overdue · ${formatDueDate(task.dueDate)}`
              : formatDueDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
