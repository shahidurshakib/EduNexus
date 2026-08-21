const map = {
  active: 'badge-moss', pending: 'badge-gold', approved: 'badge-moss',
  rejected: 'badge-red', blocked: 'badge-red', inactive: 'badge-ink',
  archived: 'badge-ink', draft: 'badge-ink', published: 'badge-moss',
  filed: 'badge-gold', granted: 'badge-moss',
}
export default function Badge({ status, children }) {
  const cls = map[status?.toLowerCase?.()] || 'badge-ink'
  return <span className={cls}>{children || status}</span>
}
