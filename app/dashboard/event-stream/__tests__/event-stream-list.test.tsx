import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import EventStreamList from '@/app/dashboard/event-stream/event-stream-list'

vi.mock('@/components/json-viewer', () => ({
  default: ({ data }: { data: unknown }) => (
    <pre data-testid="json-viewer">{JSON.stringify(data)}</pre>
  ),
}))

const mockEvents = [
  {
    id: '1',
    type: 'user.login',
    source: 'auth0',
    specversion: '1.0',
    time: new Date('2024-01-01T00:00:00Z'),
    a0stream: 'main',
    a0tenant: 'test',
    data: { user_id: 'abc', ip: '1.2.3.4' },
  },
  {
    id: '2',
    type: 'user.signup',
    source: 'auth0',
    specversion: '1.0',
    time: new Date('2024-01-02T00:00:00Z'),
    a0stream: 'main',
    a0tenant: 'test',
    data: { user_id: 'def' },
  },
]

describe('EventStreamList', () => {
  it('renders event list items', () => {
    render(<EventStreamList initialData={{ events: mockEvents }} />)
    expect(screen.getByText('user.login')).toBeInTheDocument()
    expect(screen.getByText('user.signup')).toBeInTheDocument()
  })

  it('shows JsonViewer when event is expanded', () => {
    render(<EventStreamList initialData={{ events: mockEvents }} />)

    // Click to expand first event
    fireEvent.click(screen.getByText('user.login'))

    const viewers = screen.getAllByTestId('json-viewer')
    expect(viewers.length).toBe(1)
    expect(viewers[0]).toHaveTextContent('abc')
  })

  it('hides JsonViewer when event is collapsed', () => {
    render(<EventStreamList initialData={{ events: mockEvents }} />)

    // Expand then collapse
    fireEvent.click(screen.getByText('user.login'))
    fireEvent.click(screen.getByText('user.login'))

    expect(screen.queryByTestId('json-viewer')).not.toBeInTheDocument()
  })

  it('renders empty state when no events', () => {
    render(<EventStreamList initialData={{ events: [] }} />)
    expect(
      screen.getByText('No webhook events found matching your criteria.')
    ).toBeInTheDocument()
  })
})
