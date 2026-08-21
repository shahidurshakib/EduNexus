import { useEffect, useState } from 'react'
import { listApprovals, approveApproval, rejectApproval } from '../../api/users'
import DataTable from '../../components/ui/DataTable'
import Loader from '../../components/ui/Loader'
import Badge from '../../components/ui/Badge'

const STATUSES = ['pending', 'approved', 'rejected']

export default function AdminApprovals() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    listApprovals({ status }).then((data) => setItems(data.approvals || data.requests || [])).finally(() => setLoading(false))
  }
  useEffect(load, [status])

  const act = async (fn, id) => {
    const note = prompt('Optional review note') || undefined
    await fn(id, note)
    load()
  }

  return (
    <div>
      <p className="eyebrow">Role approvals</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Approval requests</h1>

      <div className="mt-6 flex gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={status === s ? 'btn-primary !py-2 capitalize' : 'btn-secondary !py-2 capitalize'}>{s}</button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <Loader /> : (
          <DataTable
            columns={[
              { key: 'name', header: 'Applicant', render: (r) => r.full_name || r.user_name },
              { key: 'role', header: 'Requested role', render: (r) => <span className="capitalize">{r.requested_role || r.requestedRole}</span> },
              { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
              { key: 'date', header: 'Requested', render: (r) => r.created_at?.slice(0, 10) },
              {
                key: 'actions', header: 'Actions', render: (r) => r.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button className="btn-ghost !px-2 !py-1 text-xs text-moss-600" onClick={() => act(approveApproval, r.id)}>Approve</button>
                    <button className="btn-ghost !px-2 !py-1 text-xs text-red-500" onClick={() => act(rejectApproval, r.id)}>Reject</button>
                  </div>
                ) : <span className="text-xs text-ink-300">{r.review_note || '—'}</span>,
              },
            ]}
            rows={items}
            emptyLabel="No requests in this status."
          />
        )}
      </div>
    </div>
  )
}
