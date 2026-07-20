import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('@/api/health', () => ({
  getHealth: vi.fn().mockResolvedValue({ status: 'ok' }),
}))

describe('App', () => {
  it('renders the tasks page by default', () => {
    render(<App />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })
})
