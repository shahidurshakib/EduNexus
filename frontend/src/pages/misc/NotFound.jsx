import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">This record doesn't exist.</h1>
      <p className="mt-3 max-w-sm text-ink-500 dark:text-ink-400">The page you're looking for isn't in the ledger. It may have been moved or removed.</p>
      <Link to="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  )
}
