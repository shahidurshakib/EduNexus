import { Link, Outlet } from 'react-router-dom'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-ink-800 p-12 text-paper lg:flex">
        <Link to="/"><Logo /></Link>
        <div>
          <p className="eyebrow text-gold-300">Admissions ledger</p>
          <h2 className="mt-3 max-w-md font-display text-3xl leading-tight">
            Every founder, every study, every round — one verified record.
          </h2>
          <p className="mt-4 max-w-sm text-sm text-ink-200">
            EduNexus keeps a single source of truth as ideas move from the lab bench to the term sheet.
          </p>
        </div>
        <p className="font-mono text-xs text-ink-300">© {new Date().getFullYear()} EduNexus</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link to="/" className="text-ink-900 dark:text-paper"><Logo /></Link>
            <ThemeToggle />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
