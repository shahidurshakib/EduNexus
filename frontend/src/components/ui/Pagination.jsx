export default function Pagination({ page, limit, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3 font-mono text-xs">
      <button className="btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Prev</button>
      <span className="text-ink-400">Page {page} of {totalPages}</span>
      <button className="btn-ghost" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  )
}
