import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TokenCard } from '@/app/dashboard/account/tokens/token-card'

const { MockJsonViewer } = vi.hoisted(() => {
  const MockJsonViewer = ({ data }: { data: unknown }) => (
    <pre data-testid="json-viewer">{JSON.stringify(data)}</pre>
  )
  return { MockJsonViewer }
})

vi.mock('@/components/json-viewer', () => ({
  default: MockJsonViewer,
}))

vi.mock('@/components/json-viewer-skeleton', () => ({
  JsonViewerSkeleton: () => <div data-testid="json-viewer-skeleton" />,
}))

vi.mock('next/dynamic', () => ({
  default: () => MockJsonViewer,
}))

describe('TokenCard', () => {
  it('renders title and description', () => {
    render(
      <TokenCard
        title="ID Token"
        description="A test description"
        result={{ success: true, payload: { sub: '123' } }}
      />
    )
    expect(screen.getByText('ID Token')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('renders JsonViewer on success', () => {
    render(
      <TokenCard
        title="ID Token"
        description="desc"
        result={{ success: true, payload: { sub: '123' } }}
      />
    )
    expect(screen.getByTestId('json-viewer')).toBeInTheDocument()
  })

  it('renders error message on failure', () => {
    render(
      <TokenCard
        title="Access Token"
        description="desc"
        result={{ success: false, error: 'Token is opaque' }}
      />
    )
    expect(screen.getByText('Token is opaque')).toBeInTheDocument()
  })

  it('does not render JsonViewer on failure', () => {
    render(
      <TokenCard
        title="Access Token"
        description="desc"
        result={{ success: false, error: 'Token is opaque' }}
      />
    )
    expect(screen.queryByTestId('json-viewer')).not.toBeInTheDocument()
  })
})
