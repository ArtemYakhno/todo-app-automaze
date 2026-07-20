import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { HealthStatus } from './HealthStatus'
import * as healthApi from '@/api/health'

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('HealthStatus', () => {
  it('shows a healthy status when the backend responds ok', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue({ status: 'ok' })

    renderWithClient(<HealthStatus />)

    expect(await screen.findByText(/backend healthy/i)).toBeInTheDocument()
  })

  it('shows an unavailable status when the request fails', async () => {
    vi.spyOn(healthApi, 'getHealth').mockRejectedValue(new Error('network error'))

    renderWithClient(<HealthStatus />)

    expect(await screen.findByText(/backend unavailable/i)).toBeInTheDocument()
  })
})
