export default function DataTable({ columns, rows, keyField = 'id', emptyLabel = 'No records yet' }) {
  if (!rows || rows.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-400">{emptyLabel}</p>
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 dark:border-ink-700">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-ink-50 dark:bg-ink-800/60">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-4 py-3 font-mono text-xs uppercase tracking-wide text-ink-400">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
              {columns.map((c) => (
                <td key={c.key} className="whitespace-nowrap px-4 py-3 text-ink-700 dark:text-ink-200">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
