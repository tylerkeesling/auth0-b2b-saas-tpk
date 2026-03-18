import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PasskeySection } from '@/app/dashboard/account/sign-in-methods/passkey-section'
import type { Passkey } from '@/app/dashboard/account/sign-in-methods/sign-in-methods-page'

// Mock server actions
vi.mock('@/app/dashboard/account/sign-in-methods/actions', () => ({
  revokePasskey: vi.fn().mockResolvedValue({}),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock my-account-client
vi.mock('@/lib/my-account-client', () => ({
  myAccountClient: {
    authenticationMethods: {
      create: vi.fn(),
      verify: vi.fn(),
    },
  },
}))

// Mock SubmitButton as a plain submit button
vi.mock('@/components/submit-button', () => ({
  SubmitButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    variant?: string
  }) => (
    <button type="submit" {...props}>
      {children}
    </button>
  ),
}))

const TEST_USER_ID = 'auth0|test-user-123'

function createPasskey(overrides: Partial<Passkey> = {}): Passkey {
  return {
    id: 'passkey-123',
    last_auth_at: new Date().toISOString(),
    user_agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120',
    ...overrides,
  }
}

describe('PasskeySection', () => {
  describe('empty state', () => {
    it('shows add passkey prompt when no passkeys', () => {
      render(<PasskeySection passkeys={[]} userId={TEST_USER_ID} />)
      expect(screen.getByText('Add a passkey?')).toBeInTheDocument()
    })

    it('renders section title and description', () => {
      render(<PasskeySection passkeys={[]} userId={TEST_USER_ID} />)
      expect(screen.getByText('Passkeys')).toBeInTheDocument()
      expect(
        screen.getByText(/Passkeys provide a more secure/)
      ).toBeInTheDocument()
    })
  })

  describe('passkey list', () => {
    it('renders passkey id', () => {
      const passkeys = [createPasskey({ id: 'pk_abc123' })]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText('pk_abc123')).toBeInTheDocument()
    })

    it('renders user agent string', () => {
      const passkeys = [
        createPasskey({
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(
        screen.getByText('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)')
      ).toBeInTheDocument()
    })

    it('renders Last used text', () => {
      const passkeys = [createPasskey()]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/Last used/)).toBeInTheDocument()
    })

    it('renders revoke button for each passkey', () => {
      const passkeys = [
        createPasskey({ id: 'pk-1' }),
        createPasskey({ id: 'pk-2' }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      const revokeButtons = screen.getAllByText('Revoke')
      // Each passkey has a trigger button (the outer list buttons)
      expect(revokeButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('renders multiple passkeys', () => {
      const passkeys = [
        createPasskey({ id: 'pk-first' }),
        createPasskey({ id: 'pk-second' }),
        createPasskey({ id: 'pk-third' }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText('pk-first')).toBeInTheDocument()
      expect(screen.getByText('pk-second')).toBeInTheDocument()
      expect(screen.getByText('pk-third')).toBeInTheDocument()
    })

    it('shows add passkey button when passkeys exist', () => {
      const passkeys = [createPasskey()]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText('Add a passkey')).toBeInTheDocument()
    })
  })

  describe('timeAgo display', () => {
    it('shows "just now" for recent dates', () => {
      const passkeys = [
        createPasskey({ last_auth_at: new Date().toISOString() }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/just now/)).toBeInTheDocument()
    })

    it('shows days ago for older dates', () => {
      const threeDaysAgo = new Date(
        Date.now() - 3 * 24 * 60 * 60 * 1000
      ).toISOString()
      const passkeys = [createPasskey({ last_auth_at: threeDaysAgo })]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/3 days ago/)).toBeInTheDocument()
    })

    it('shows months ago for older dates', () => {
      const twoMonthsAgo = new Date(
        Date.now() - 65 * 24 * 60 * 60 * 1000
      ).toISOString()
      const passkeys = [createPasskey({ last_auth_at: twoMonthsAgo })]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/2 months ago/)).toBeInTheDocument()
    })

    it('shows singular form for 1 unit', () => {
      const oneDayAgo = new Date(
        Date.now() - 1 * 24 * 60 * 60 * 1000
      ).toISOString()
      const passkeys = [createPasskey({ last_auth_at: oneDayAgo })]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/1 day ago/)).toBeInTheDocument()
    })
  })

  describe('device icon detection', () => {
    // These test that the component renders without error for different user agents.
    // We can't directly test which icon is rendered since they're SVGs,
    // but we verify the component handles each device type.
    it('renders for mobile user agent', () => {
      const passkeys = [
        createPasskey({
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/iPhone/)).toBeInTheDocument()
    })

    it('renders for desktop Mac user agent', () => {
      const passkeys = [
        createPasskey({
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/Macintosh/)).toBeInTheDocument()
    })

    it('renders for Windows user agent', () => {
      const passkeys = [
        createPasskey({
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }),
      ]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText(/Windows/)).toBeInTheDocument()
    })

    it('renders for unknown user agent', () => {
      const passkeys = [createPasskey({ user_agent: 'UnknownBot/1.0' })]
      render(<PasskeySection passkeys={passkeys} userId={TEST_USER_ID} />)
      expect(screen.getByText('UnknownBot/1.0')).toBeInTheDocument()
    })
  })
})
