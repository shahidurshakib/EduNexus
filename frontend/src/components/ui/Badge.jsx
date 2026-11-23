const map = {
  active: 'badge-moss', pending: 'badge-gold', approved: 'badge-moss',
  rejected: 'badge-red', blocked: 'badge-red', inactive: 'badge-ink',
  archived: 'badge-ink', draft: 'badge-ink', published: 'badge-moss',
<<<<<<< HEAD
  filed: 'badge-gold', granted: 'badge-moss', revised: 'badge-red',
=======
  filed: 'badge-gold', granted: 'badge-moss',
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
}
export default function Badge({ status, children }) {
  const cls = map[status?.toLowerCase?.()] || 'badge-ink'
  return <span className={cls}>{children || status}</span>
}
