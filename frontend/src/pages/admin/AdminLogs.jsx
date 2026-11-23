import { useEffect, useState } from 'react'
import { getActivityLogs, getLoginLogs } from '../../api/logs'
import DataTable from '../../components/ui/DataTable'
import Loader from '../../components/ui/Loader'
import Pagination from '../../components/ui/Pagination'

export default function AdminLogs() {
  const [tab, setTab] = useState('activity')
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 15

  useEffect(() => {
    setLoading(true)
    const fn = tab === 'activity' ? getActivityLogs : getLoginLogs
    fn({ page, limit }).then((data) => { setItems(data.logs || []); setTotal(data.total || 0) }).finally(() => setLoading(false))
  }, [tab, page])

  return (
    <div>
      <p className="eyebrow">Logs</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Activity & login logs</h1>

      <div className="mt-6 flex gap-2">
        <button onClick={() => { setTab('activity'); setPage(1) }} className={tab === 'activity' ? 'btn-primary !py-2' : 'btn-secondary !py-2'}>Activity</button>
        <button onClick={() => { setTab('login'); setPage(1) }} className={tab === 'login' ? 'btn-primary !py-2' : 'btn-secondary !py-2'}>Login</button>
      </div>

      <div className="mt-6">
        {loading ? <Loader /> : tab === 'activity' ? (
          <DataTable
            columns={[
              { key: 'user', header: 'User', render: (r) => r.user_name || r.full_name },
              { key: 'action', header: 'Action', render: (r) => r.action },
              { key: 'entity', header: 'Entity', render: (r) => `${r.entity_type || ''} #${r.entity_id ?? ''}` },
              { key: 'when', header: 'When', render: (r) => new Date(r.created_at).toLocaleString() },
            ]}
            rows={items}
          />
        ) : (
          <DataTable
            columns={[
              { key: 'user', header: 'User', render: (r) => r.user_name || r.full_name },
              { key: 'ip', header: 'IP address', render: (r) => r.ip_address },
              { key: 'status', header: 'Result', render: (r) => r.status || (r.success ? 'success' : 'failed') },
              { key: 'when', header: 'When', render: (r) => new Date(r.created_at).toLocaleString() },
            ]}
            rows={items}
          />
        )}
        <Pagination page={page} limit={limit} total={total} onChange={setPage} />
      </div>
    </div>
  )
}
