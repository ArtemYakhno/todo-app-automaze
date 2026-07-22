import { Skeleton } from "@/components/ui/skeleton";

export function TaskListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  );
}
