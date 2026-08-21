import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <Logo className="text-ink-900 dark:text-paper" />
          <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-ink-400">
            The campus-to-market pipeline connecting student founders, faculty research, mentors and investors.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Platform</p>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li><Link to="/vision" className="hover:text-gold-600">Vision</Link></li>
            <li><Link to="/mission" className="hover:text-gold-600">Mission</Link></li>
            <li><Link to="/startups" className="hover:text-gold-600">Startup directory</Link></li>
            <li><Link to="/research" className="hover:text-gold-600">Research archive</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Community</p>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li><Link to="/mentors" className="hover:text-gold-600">Mentors</Link></li>
            <li><Link to="/investors" className="hover:text-gold-600">Investors</Link></li>
            <li><Link to="/about" className="hover:text-gold-600">About</Link></li>
            <li><Link to="/contact" className="hover:text-gold-600">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Account</p>
          <ul className="space-y-2 text-sm text-ink-500 dark:text-ink-400">
            <li><Link to="/login" className="hover:text-gold-600">Log in</Link></li>
            <li><Link to="/register" className="hover:text-gold-600">Register</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100 py-6 text-center font-mono text-xs text-ink-400 dark:border-ink-800">
        © {new Date().getFullYear()} EduNexus. Built on campus, backed by ventures.
      </div>
    </footer>
  )
}
