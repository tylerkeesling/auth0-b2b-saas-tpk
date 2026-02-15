import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import UserSessions from '@/app/dashboard/account/sessions/user-sessions'

// Mock server actions
vi.mock('@/app/dashboard/account/sessions/actions', () => ({
  deleteSession: vi.fn().mockResolvedValue({}),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock SubmitButton as a plain submit button
vi.mock('@/components/submit-button', () => ({
  SubmitButton: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    variant?: string
    size?: string
  }) => (
    <button type="submit" {...props}>
      {children}
    </button>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

function createSession(overrides: Record<string, any> = {}) {
  return {
    id: 'sess_default',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-02-14T10:00:00Z',
    last_interacted_at: '2026-02-14T10:00:00Z',
    device: {
      last_user_agent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      last_ip: '192.168.1.1',
    },
    authentication: { methods: [{ name: 'pwd' }] },
    ...overrides,
  }
}

const defaultUser = { sid: 'sess_current', sub: 'auth0|123' }

describe('UserSessions', () => {
  describe('rendering', () => {
    it('renders the card container', () => {
      const { container } = render(
        <UserSessions user={defaultUser} sessions={[]} />
      )
      const card = container.firstChild as HTMLElement
      expect(card.className).toContain('bg-card')
      expect(card.className).toContain('rounded-lg')
      expect(card.className).toContain('border')
    })

    it('renders session rows for each session', () => {
      const sessions = [
        createSession({ id: 'sess_1' }),
        createSession({ id: 'sess_2' }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const browserTexts = screen.getAllByText(/Chrome on/)
      expect(browserTexts).toHaveLength(2)
    })

    it('renders multiple sessions with different data', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          device: {
            last_user_agent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/120.0',
            last_ip: '10.0.0.1',
          },
        }),
        createSession({
          id: 'sess_2',
          device: {
            last_user_agent:
              'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
            last_ip: '10.0.0.2',
          },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.getByText(/Firefox on/)).toBeInTheDocument()
      expect(screen.getByText(/Mobile Safari on/)).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows "No active sessions" when sessions array is empty', () => {
      render(<UserSessions user={defaultUser} sessions={[]} />)
      expect(screen.getByText('No active sessions')).toBeInTheDocument()
    })

    it('does not render any session rows when empty', () => {
      render(<UserSessions user={defaultUser} sessions={[]} />)
      expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
      expect(screen.queryByText('Current')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when sessions is undefined', () => {
      render(<UserSessions user={defaultUser} sessions={undefined} />)
      expect(
        screen.getByText(
          'There was a problem loading your sessions. Try again later.'
        )
      ).toBeInTheDocument()
    })

    it('does not show empty state when sessions is undefined', () => {
      render(<UserSessions user={defaultUser} sessions={undefined} />)
      expect(screen.queryByText('No active sessions')).not.toBeInTheDocument()
    })
  })

  describe('current session badge', () => {
    it('shows "Current" badge for session matching user.sid', () => {
      const sessions = [createSession({ id: 'sess_current' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.getByText('Current')).toBeInTheDocument()
    })

    it('does not show "Current" badge for non-matching sessions', () => {
      const sessions = [createSession({ id: 'sess_other' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.queryByText('Current')).not.toBeInTheDocument()
    })

    it('shows badge only on the correct session when multiple exist', () => {
      const sessions = [
        createSession({ id: 'sess_current' }),
        createSession({ id: 'sess_other' }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const badges = screen.getAllByText('Current')
      expect(badges).toHaveLength(1)
    })
  })

  describe('session info display', () => {
    it('displays browser and OS from user agent', () => {
      const sessions = [createSession({ id: 'sess_1' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.getByText(/Chrome on/)).toBeInTheDocument()
      expect(screen.getByText(/macOS/)).toBeInTheDocument()
    })

    it('displays IP address', () => {
      const sessions = [createSession({ id: 'sess_1' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const ipElements = screen.getAllByText(/192\.168\.1\.1/)
      expect(ipElements.length).toBeGreaterThanOrEqual(1)
    })

    it('hides IP section when last_ip is not available', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          device: {
            last_user_agent: 'Mozilla/5.0 Chrome/120',
            last_ip: null,
          },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.queryByText(/IP:/)).not.toBeInTheDocument()
    })

    it('displays authentication method label', () => {
      const sessions = [createSession({ id: 'sess_1' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const elements = screen.getAllByText(/Signed in via Password/)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('displays creation date', () => {
      const sessions = [createSession({ id: 'sess_1' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const dateElements = screen.getAllByText(/Jan 15, 2026/)
      expect(dateElements.length).toBeGreaterThanOrEqual(1)
    })

    it('handles missing device info gracefully', () => {
      const sessions = [createSession({ id: 'sess_1', device: undefined })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(
        screen.getByText(/Unknown browser on Unknown OS/)
      ).toBeInTheDocument()
    })
  })

  describe('auth method labels', () => {
    it('shows "Password" for pwd method', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          authentication: { methods: [{ name: 'pwd' }] },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const elements = screen.getAllByText(/Signed in via Password/)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Social / SSO" for federated method', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          authentication: { methods: [{ name: 'federated' }] },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const elements = screen.getAllByText(/Signed in via Social \/ SSO/)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('shows "Passkey" for passkey method', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          authentication: { methods: [{ name: 'passkey' }] },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const elements = screen.getAllByText(/Signed in via Passkey/)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('falls back to raw method name for unknown methods', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          authentication: { methods: [{ name: 'custom-method' }] },
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const elements = screen.getAllByText(/Signed in via custom-method/)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    })

    it('omits auth method text when no methods available', () => {
      const sessions = [
        createSession({
          id: 'sess_1',
          authentication: undefined,
        }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.queryByText(/Signed in via/)).not.toBeInTheDocument()
    })
  })

  describe('sorting', () => {
    it('places current session first', () => {
      const sessions = [
        createSession({ id: 'sess_other' }),
        createSession({ id: 'sess_current' }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      // The "Current" badge should exist and be inside the first grid row
      const currentBadge = screen.getByText('Current')
      const gridRow = currentBadge.closest('[class*="grid"]')
      expect(gridRow).toBeTruthy()
      // It should be the first row (no preceding separator)
      const parentDiv = gridRow!.parentElement
      expect(parentDiv?.previousElementSibling).toBeNull()
    })
  })

  describe('revoke flow', () => {
    it('shows Revoke button for non-current sessions', () => {
      const sessions = [createSession({ id: 'sess_other' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      expect(screen.getByText('Revoke')).toBeInTheDocument()
    })

    it('hides Revoke button for current session', () => {
      const sessions = [createSession({ id: 'sess_current' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      // There should be no Revoke button (the trigger, not the dialog one)
      expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
    })

    it('clicking Revoke opens confirmation dialog', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'sess_other' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      await user.click(screen.getByText('Revoke'))
      expect(screen.getByText('Revoke session')).toBeInTheDocument()
      expect(
        screen.getByText(/This will permanently sign out this session/)
      ).toBeInTheDocument()
    })

    it('dialog shows Cancel and Revoke buttons', async () => {
      const user = userEvent.setup()
      const sessions = [createSession({ id: 'sess_other' })]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      await user.click(screen.getByText('Revoke'))
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      const revokeButtons = screen.getAllByText('Revoke')
      expect(revokeButtons.length).toBeGreaterThanOrEqual(2)
    })

    it('shows Revoke only for non-current sessions when multiple exist', () => {
      const sessions = [
        createSession({ id: 'sess_current' }),
        createSession({ id: 'sess_other_1' }),
        createSession({ id: 'sess_other_2' }),
      ]
      render(<UserSessions user={defaultUser} sessions={sessions} />)
      const revokeButtons = screen.getAllByText('Revoke')
      expect(revokeButtons).toHaveLength(2)
    })
  })
})
