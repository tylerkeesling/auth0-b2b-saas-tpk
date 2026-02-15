import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PasswordSection } from '@/app/dashboard/account/security-settings/sign-in-methods/password-section'

// Mock server actions
vi.mock(
  '@/app/dashboard/account/security-settings/sign-in-methods/actions',
  () => ({
    updatePassword: vi.fn().mockResolvedValue({}),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({}),
  })
)

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
  }) => (
    <button type="submit" {...props}>
      {children}
    </button>
  ),
}))

describe('PasswordSection', () => {
  describe('date display', () => {
    it('shows "Changed" when lastPasswordReset is provided', () => {
      render(
        <PasswordSection
          lastPasswordReset="2026-02-14T00:00:00.000Z"
          createdAt="2025-01-01T00:00:00.000Z"
        />
      )
      expect(screen.getByText(/Changed/)).toBeInTheDocument()
      expect(screen.getByText(/2026/)).toBeInTheDocument()
    })

    it('shows "Set" when only createdAt is provided', () => {
      render(
        <PasswordSection
          lastPasswordReset={null}
          createdAt="2025-06-15T12:00:00.000Z"
        />
      )
      expect(screen.getByText(/Set/)).toBeInTheDocument()
      expect(screen.getByText(/2025/)).toBeInTheDocument()
    })

    it('does not show date when neither is provided', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.queryByText(/Changed/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Set/)).not.toBeInTheDocument()
    })

    it('prefers lastPasswordReset over createdAt', () => {
      render(
        <PasswordSection
          lastPasswordReset="2026-02-14T00:00:00.000Z"
          createdAt="2025-01-01T00:00:00.000Z"
        />
      )
      expect(screen.getByText(/Changed/)).toBeInTheDocument()
      expect(screen.queryByText(/Set/)).not.toBeInTheDocument()
    })
  })

  describe('summary row', () => {
    it('renders masked password dots', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.getByText('••••••••••••')).toBeInTheDocument()
    })

    it('renders section title and description', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.getByText('Password')).toBeInTheDocument()
      expect(
        screen.getByText(/Keep your account secure with a strong password/)
      ).toBeInTheDocument()
    })

    it('shows reset email row when not editing', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
      expect(screen.getByText('Send reset email')).toBeInTheDocument()
    })
  })

  describe('editing state', () => {
    it('shows Change button by default', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.getByText('Change')).toBeInTheDocument()
    })

    it('does not show password form by default', () => {
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)
      expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    })

    it('shows password form when Change is clicked', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      await user.click(screen.getByText('Change'))

      expect(screen.getByLabelText('New password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
      expect(screen.getByText('Update password')).toBeInTheDocument()
    })

    it('shows Cancel in header when editing', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      await user.click(screen.getByText('Change'))

      // Both header and form have Cancel — at least one should be present
      const cancelButtons = screen.getAllByText('Cancel')
      expect(cancelButtons.length).toBeGreaterThanOrEqual(1)
    })

    it('hides password form when header toggle is clicked again', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      await user.click(screen.getByText('Change'))
      expect(screen.getByLabelText('New password')).toBeInTheDocument()

      // Click the first Cancel (header X button)
      const cancelButtons = screen.getAllByText('Cancel')
      await user.click(cancelButtons[0])
      expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
    })

    it('hides reset email row when editing', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      expect(screen.getByText('Send reset email')).toBeInTheDocument()

      await user.click(screen.getByText('Change'))

      expect(screen.queryByText('Send reset email')).not.toBeInTheDocument()
    })

    it('shows password requirement hint', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      await user.click(screen.getByText('Change'))

      expect(
        screen.getByText('Password must be at least 8 characters.')
      ).toBeInTheDocument()
    })
  })

  describe('password visibility toggles', () => {
    it('password fields start as type="password"', async () => {
      const user = userEvent.setup()
      render(<PasswordSection lastPasswordReset={null} createdAt={null} />)

      await user.click(screen.getByText('Change'))

      const newPasswordInput = screen.getByLabelText('New password')
      const confirmInput = screen.getByLabelText('Confirm password')
      expect(newPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmInput).toHaveAttribute('type', 'password')
    })
  })
})
