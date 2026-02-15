import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EmailSection } from '@/app/dashboard/account/sign-in-methods/email-section'

// Mock server actions
vi.mock('@/app/dashboard/account/sign-in-methods/actions', () => ({
  updateEmail: vi.fn().mockResolvedValue({}),
  sendVerificationEmail: vi.fn().mockResolvedValue({}),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock SubmitButton as a plain submit button (useFormStatus doesn't work outside real forms in test)
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

describe('EmailSection', () => {
  describe('verified email', () => {
    it('renders the email address', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('shows Verified badge', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(screen.getByText('Verified')).toBeInTheDocument()
    })

    it('does not show Unverified badge', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(screen.queryByText('Unverified')).not.toBeInTheDocument()
    })

    it('does not show verification resend row', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(
        screen.queryByText('Your email is not verified.')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('Resend verification')).not.toBeInTheDocument()
    })

    it('renders the section title and description', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(screen.getByText('Email address')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Used for sign-in, notifications, and account recovery.'
        )
      ).toBeInTheDocument()
    })
  })

  describe('unverified email', () => {
    it('shows Unverified badge', () => {
      render(<EmailSection email="john@example.com" emailVerified={false} />)
      expect(screen.getByText('Unverified')).toBeInTheDocument()
    })

    it('does not show Verified badge', () => {
      render(<EmailSection email="john@example.com" emailVerified={false} />)
      expect(screen.queryByText('Verified')).not.toBeInTheDocument()
    })

    it('shows verification resend row when not editing', () => {
      render(<EmailSection email="john@example.com" emailVerified={false} />)
      expect(
        screen.getByText('Your email is not verified.')
      ).toBeInTheDocument()
      expect(screen.getByText('Resend verification')).toBeInTheDocument()
    })
  })

  describe('editing state', () => {
    it('shows Change button by default', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(screen.getByText('Change')).toBeInTheDocument()
    })

    it('does not show edit form by default', () => {
      render(<EmailSection email="john@example.com" emailVerified={true} />)
      expect(
        screen.queryByLabelText('New email address')
      ).not.toBeInTheDocument()
    })

    it('shows edit form when Change is clicked', async () => {
      const user = userEvent.setup()
      render(<EmailSection email="john@example.com" emailVerified={true} />)

      await user.click(screen.getByText('Change'))

      expect(screen.getByLabelText('New email address')).toBeInTheDocument()
      expect(screen.getByText('Update email')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Enter new email address')
      ).toBeInTheDocument()
    })

    it('toggles button text to Cancel when editing', async () => {
      const user = userEvent.setup()
      render(<EmailSection email="john@example.com" emailVerified={true} />)

      await user.click(screen.getByText('Change'))

      expect(screen.getByText('Cancel')).toBeInTheDocument()
      expect(screen.queryByText('Change')).not.toBeInTheDocument()
    })

    it('hides edit form when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<EmailSection email="john@example.com" emailVerified={true} />)

      await user.click(screen.getByText('Change'))
      expect(screen.getByLabelText('New email address')).toBeInTheDocument()

      await user.click(screen.getByText('Cancel'))
      expect(
        screen.queryByLabelText('New email address')
      ).not.toBeInTheDocument()
    })

    it('hides verification resend row when editing (unverified)', async () => {
      const user = userEvent.setup()
      render(<EmailSection email="john@example.com" emailVerified={false} />)

      expect(screen.getByText('Resend verification')).toBeInTheDocument()

      await user.click(screen.getByText('Change'))

      expect(screen.queryByText('Resend verification')).not.toBeInTheDocument()
    })
  })
})
