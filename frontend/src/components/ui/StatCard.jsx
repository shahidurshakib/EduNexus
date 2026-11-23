export default function StatCard({ label, value, hint, accent = 'gold' }) {
  const accents = {
    gold: 'text-gold-500',
    moss: 'text-moss-500',
    ink: 'text-ink-500 dark:text-ink-200',
  }
  return (
    <div className="card">
      <p className="eyebrow">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}
