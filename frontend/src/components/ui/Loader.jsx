export default function Loader({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-400 dark:text-ink-400">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-200 border-t-gold-400 dark:border-ink-600" />
      <span className="font-mono text-xs uppercase tracking-wider">{label}…</span>
    </div>
  )
}
