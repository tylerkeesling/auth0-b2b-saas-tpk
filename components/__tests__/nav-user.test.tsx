import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SidebarProvider } from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const user = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  picture: 'https://example.com/avatar.jpg',
}

function renderNavUser(props = {}) {
  return render(
    <SidebarProvider>
      <NavUser user={user} {...props} />
    </SidebarProvider>
  )
}

function openUserDropdown() {
  const trigger = screen.getByText('Jane Smith').closest('button')!
  fireEvent.pointerDown(trigger, { button: 0, pointerType: 'mouse' })
}

describe('NavUser', () => {
  it('renders user name and email', () => {
    renderNavUser()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders avatar fallback from first letter of name', () => {
    renderNavUser()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('opens dropdown with profile and logout links', () => {
    renderNavUser()
    openUserDropdown()

    const profileLink = screen.getByText('Profile').closest('a')
    expect(profileLink).toHaveAttribute('href', '/dashboard/account/profile')

    const logoutLink = screen.getByText('Log out').closest('a')
    expect(logoutLink).toHaveAttribute('href', '/auth/logout')
  })
})
