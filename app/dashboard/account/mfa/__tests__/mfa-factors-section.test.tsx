import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  MfaFactorsSection,
  type MfaFactor,
} from '@/app/dashboard/account/mfa/mfa-factors-section'

// Mock server actions
vi.mock('@/app/dashboard/account/mfa/actions', () => ({
  createEnrollment: vi
    .fn()
    .mockResolvedValue({ ticketUrl: 'https://example.com/enroll' }),
  deleteEnrollment: vi.fn().mockResolvedValue({}),
  setPreferredMethod: vi.fn().mockResolvedValue({}),
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

function createFactor(overrides: Partial<MfaFactor> = {}): MfaFactor {
  return { name: 'otp', tenantEnabled: true, orgEnabled: true, ...overrides }
}

const defaultProps = {
  factors: [] as MfaFactor[],
  preferredMethod: null as string | null,
}

describe('MfaFactorsSection', () => {
  describe('section structure', () => {
    it('renders section title "MFA factors" and description text', () => {
      render(<MfaFactorsSection {...defaultProps} />)
      expect(screen.getByText('MFA factors')).toBeInTheDocument()
      expect(
        screen.getByText(/Add a second layer of security/)
      ).toBeInTheDocument()
    })

    it('renders the two-column grid layout', () => {
      const { container } = render(<MfaFactorsSection {...defaultProps} />)
      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
      expect(grid?.className).toContain('lg:grid-cols-[280px_1fr]')
    })
  })

  describe('empty state', () => {
    it('shows "No MFA factors available" when factors array is empty', () => {
      render(<MfaFactorsSection {...defaultProps} />)
      expect(screen.getByText('No MFA factors available')).toBeInTheDocument()
    })

    it('does not render any factor rows when empty', () => {
      render(<MfaFactorsSection {...defaultProps} />)
      expect(screen.queryByText('One-time Password')).not.toBeInTheDocument()
      expect(screen.queryByText('Phone Message')).not.toBeInTheDocument()
    })
  })

  describe('factor list rendering', () => {
    it('renders factor title from factorsMeta for each factor', () => {
      const factors = [createFactor({ name: 'otp' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
    })

    it('renders factor description for each factor', () => {
      const factors = [createFactor({ name: 'otp' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(
        screen.getByText('Use an authenticator app like Google Authenticator')
      ).toBeInTheDocument()
    })

    it('renders correct number of factor rows for multiple factors', () => {
      const factors = [
        createFactor({ name: 'otp' }),
        createFactor({ name: 'sms' }),
        createFactor({ name: 'email' }),
      ]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
      expect(screen.getByText('Phone Message')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
    })

    it('does not show empty state when factors exist', () => {
      const factors = [createFactor()]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(
        screen.queryByText('No MFA factors available')
      ).not.toBeInTheDocument()
    })
  })

  describe('enrollment status', () => {
    it('shows "Enrolled" badge when factor has enrollmentId', () => {
      const factors = [createFactor({ enrollmentId: 'enr_123' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('Enrolled')).toBeInTheDocument()
    })

    it('does not show "Enrolled" badge when factor has no enrollmentId', () => {
      const factors = [createFactor()]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.queryByText('Enrolled')).not.toBeInTheDocument()
    })

    it('shows "Enroll" button for non-enrolled factors', () => {
      const factors = [createFactor()]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('Enroll')).toBeInTheDocument()
    })

    it('shows "Remove" button for enrolled factors', () => {
      const factors = [createFactor({ enrollmentId: 'enr_123' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('Remove')).toBeInTheDocument()
    })
  })

  describe('preferred method', () => {
    it('shows "Preferred" badge when factor matches preferredMethod', () => {
      const factors = [createFactor({ name: 'otp', enrollmentId: 'enr_123' })]
      render(
        <MfaFactorsSection
          {...defaultProps}
          factors={factors}
          preferredMethod="otp"
        />
      )
      expect(screen.getByText('Preferred')).toBeInTheDocument()
    })

    it('does not show "Preferred" badge when factor does not match preferredMethod', () => {
      const factors = [createFactor({ name: 'otp', enrollmentId: 'enr_123' })]
      render(
        <MfaFactorsSection
          {...defaultProps}
          factors={factors}
          preferredMethod="sms"
        />
      )
      expect(screen.queryByText('Preferred')).not.toBeInTheDocument()
    })

    it('shows "Set as preferred" button for enrolled non-preferred factors', () => {
      const factors = [createFactor({ name: 'otp', enrollmentId: 'enr_123' })]
      render(
        <MfaFactorsSection
          {...defaultProps}
          factors={factors}
          preferredMethod="sms"
        />
      )
      expect(screen.getByText('Set as preferred')).toBeInTheDocument()
    })

    it('does not show "Set as preferred" for the already-preferred factor', () => {
      const factors = [createFactor({ name: 'otp', enrollmentId: 'enr_123' })]
      render(
        <MfaFactorsSection
          {...defaultProps}
          factors={factors}
          preferredMethod="otp"
        />
      )
      expect(screen.queryByText('Set as preferred')).not.toBeInTheDocument()
    })
  })

  describe('remove confirmation', () => {
    it('clicking "Remove" opens an AlertDialog with confirmation text', async () => {
      const user = userEvent.setup()
      const factors = [createFactor({ enrollmentId: 'enr_123' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      await user.click(screen.getByText('Remove'))
      expect(screen.getByText('Remove MFA enrollment')).toBeInTheDocument()
      expect(
        screen.getByText(/This will permanently remove your/)
      ).toBeInTheDocument()
    })

    it('AlertDialog shows "Cancel" and "Remove" buttons', async () => {
      const user = userEvent.setup()
      const factors = [createFactor({ enrollmentId: 'enr_123' })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      await user.click(screen.getByText('Remove'))
      expect(screen.getByText('Cancel')).toBeInTheDocument()
      // There should be a Remove button inside the dialog (the submit button)
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('org policy filtering', () => {
    it('shows all tenant-enabled factors when orgEnabled is true', () => {
      const factors = [
        createFactor({ name: 'otp' }),
        createFactor({ name: 'sms' }),
      ]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
      expect(screen.getByText('Phone Message')).toBeInTheDocument()
    })

    it('shows greyed out factor when orgEnabled is false', () => {
      const factors = [createFactor({ name: 'otp', orgEnabled: false })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
      const enrollButton = screen.getByText('Enroll').closest('button')
      expect(enrollButton).toBeDisabled()
      expect(
        screen.getByText('Not enabled by your organization')
      ).toBeInTheDocument()
    })

    it('shows normal Enroll button when orgEnabled is true', () => {
      const factors = [createFactor({ name: 'otp', orgEnabled: true })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      const enrollButton = screen.getByText('Enroll').closest('button')
      expect(enrollButton).not.toBeDisabled()
      expect(
        screen.queryByText('Not enabled by your organization')
      ).not.toBeInTheDocument()
    })

    it('always shows enrolled factors even when orgEnabled is false', () => {
      const factors = [
        createFactor({
          name: 'otp',
          orgEnabled: false,
          enrollmentId: 'enr_123',
        }),
      ]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
      expect(screen.getByText('Enrolled')).toBeInTheDocument()
      expect(screen.getByText('Remove')).toBeInTheDocument()
      expect(
        screen.queryByText('Not enabled by your organization')
      ).not.toBeInTheDocument()
    })

    it('always shows enrolled factors even when tenantEnabled is false', () => {
      const factors = [
        createFactor({
          name: 'otp',
          tenantEnabled: false,
          enrollmentId: 'enr_123',
        }),
      ]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.getByText('One-time Password')).toBeInTheDocument()
    })

    it('hides factors when tenantEnabled is false and not enrolled', () => {
      const factors = [createFactor({ name: 'otp', tenantEnabled: false })]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      expect(screen.queryByText('One-time Password')).not.toBeInTheDocument()
    })

    it('sorts org-disabled factors to the bottom of the list', () => {
      const factors = [
        createFactor({ name: 'email', orgEnabled: false }),
        createFactor({ name: 'otp', orgEnabled: true }),
        createFactor({ name: 'sms', orgEnabled: false }),
        createFactor({ name: 'push-notification', orgEnabled: true }),
      ]
      render(<MfaFactorsSection {...defaultProps} factors={factors} />)
      const titles = screen
        .getAllByText(/One-time Password|Phone Message|Email|Push Notification/)
        .map((el) => el.textContent)
      expect(titles).toEqual([
        'One-time Password',
        'Push Notification',
        'Email',
        'Phone Message',
      ])
    })
  })
})
