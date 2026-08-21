export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 py-16 text-center dark:border-ink-700">
      <p className="font-display text-lg text-ink-700 dark:text-ink-200">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
