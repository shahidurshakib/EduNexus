import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/startups', label: 'Startups' },
  { to: '/research', label: 'Research' },
  { to: '/mentors', label: 'Mentors' },
  { to: '/investors', label: 'Investors' },
  { to: '/members', label: 'Members' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur dark:border-ink-800 dark:bg-ink-900/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="text-ink-900 dark:text-paper"><Logo /></Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-gold-600 dark:text-gold-400' : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-paper'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="btn-primary">Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Join EduNexus</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
            <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
            <span className="block h-0.5 w-6 bg-ink-800 dark:bg-paper" />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-paper px-5 py-4 dark:border-ink-800 dark:bg-ink-900 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-ink-700 dark:text-ink-200">{l.label}</NavLink>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              {user ? (
                <Link to="/dashboard" className="btn-primary flex-1 justify-center" onClick={() => setOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary flex-1 justify-center" onClick={() => setOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary flex-1 justify-center" onClick={() => setOpen(false)}>Join</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
