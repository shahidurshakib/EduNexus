
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const NAV = {
  platform_founder: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/admin/users', label: 'Users' },
    { to: '/dashboard/admin/approvals', label: 'Approvals' },
    { to: '/dashboard/startups', label: 'Startups' },
    { to: '/dashboard/research', label: 'Research' },
    { to: '/dashboard/admin/funding', label: 'Funding' },
    { to: '/dashboard/admin/reports', label: 'Reports' },
    { to: '/dashboard/admin/logs', label: 'Activity logs' },
    { to: '/dashboard/requests', label: 'Requests' },
    { to: '/dashboard/notifications', label: 'Notifications' },
  ],
  admin: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/admin/users', label: 'Users' },
    { to: '/dashboard/admin/approvals', label: 'Approvals' },
    { to: '/dashboard/startups', label: 'Startups' },
    { to: '/dashboard/research', label: 'Research' },
    { to: '/dashboard/admin/funding', label: 'Funding' },
    { to: '/dashboard/admin/reports', label: 'Reports' },
    { to: '/dashboard/admin/logs', label: 'Activity logs' },
    { to: '/dashboard/requests', label: 'Requests' },
    { to: '/dashboard/notifications', label: 'Notifications' },
  ],
  mentor: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/startups', label: 'My startups' },
    { to: '/dashboard/profile', label: 'Public profile' },
    { to: '/dashboard/requests', label: 'Requests' },
    { to: '/dashboard/notifications', label: 'Notifications' },
  ],
  investor: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/startups', label: 'Portfolio' },
    { to: '/dashboard/profile', label: 'Public profile' },
    { to: '/dashboard/requests', label: 'Requests' },
    { to: '/dashboard/notifications', label: 'Notifications' },
  ],
  member: [
    { to: '/dashboard', label: 'Overview', end: true },
    { to: '/dashboard/startups', label: 'My startups' },
    { to: '/dashboard/research', label: 'My research' },
    { to: '/dashboard/requests', label: 'Requests' },
    { to: '/dashboard/notifications', label: 'Notifications' },
  ],
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const items = NAV[user?.role] || NAV.member

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const SidebarContent = (
    <>
      <Link to="/" className="mb-8 block text-paper">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-400 text-ink-900'
                  : 'text-ink-200 hover:bg-ink-700'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 border-t border-ink-700 pt-4">
        <p className="truncate text-sm font-medium text-paper">
          {user?.full_name}
        </p>
        <p className="badge-gold mb-3 mt-1 inline-block capitalize">
          {user?.role?.replace('_', ' ')}
        </p>
        <button
          onClick={handleLogout}
          className="btn-secondary w-full !border-ink-600 !text-ink-200 hover:!bg-ink-700"
        >
          Log out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden flex-col bg-ink-800 p-6 lg:flex">
        {SidebarContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col overflow-y-auto bg-ink-800 p-6">
            {SidebarContent}
          </div>
          <div
            className="flex-1 bg-ink-950/50"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-ink-100 bg-white px-5 dark:border-ink-800 dark:bg-ink-900 lg:px-8">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
              <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
              <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
            </div>
          </button>

          <p className="hidden font-display text-lg lg:block">Dashboard</p>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/notifications"
              className="text-sm text-ink-500 hover:text-gold-600 dark:text-ink-300"
            >
              Notifications
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
