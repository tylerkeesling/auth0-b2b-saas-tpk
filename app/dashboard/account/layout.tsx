interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  return <div className="mx-auto max-w-6xl">{children}</div>
}
