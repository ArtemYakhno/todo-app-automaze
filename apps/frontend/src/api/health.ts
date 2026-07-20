import { apiClient } from './client'

export interface HealthStatus {
  status: 'ok' | 'error'
}

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await apiClient.get<HealthStatus>('/health')
  return data
}
