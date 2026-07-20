import { useHealthQuery } from '@/queries/useHealthQuery'

export function HealthStatus() {
  const { data, isPending, isError } = useHealthQuery()

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Checking backend…</p>
  }
  if (isError || data.status !== 'ok') {
    return <p className="text-sm text-red-500">Backend unavailable</p>
  }
  return <p className="text-sm text-green-500">Backend healthy</p>
}
