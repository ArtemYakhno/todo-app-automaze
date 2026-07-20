import { HealthStatus } from '@/features/health/HealthStatus'

export function TasksPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-4">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      <HealthStatus />
    </div>
  )
}
