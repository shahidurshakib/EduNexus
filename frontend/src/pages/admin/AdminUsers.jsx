import { useEffect, useState } from 'react'
<<<<<<< HEAD
import { listUsers, suspendUser, activateUser, deleteUser, removeAdmin, makeAdmin } from '../../api/users'
=======
import { listUsers, suspendUser, activateUser, deleteUser, removeAdmin } from '../../api/users'
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
import DataTable from '../../components/ui/DataTable'
import Loader from '../../components/ui/Loader'
import Pagination from '../../components/ui/Pagination'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

const ROLES = ['', 'admin', 'mentor', 'investor', 'member']

export default function AdminUsers() {
  const { user: me } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const limit = 12

  const load = () => {
    setLoading(true)
    listUsers({ role: role || undefined, search: search || undefined, page, limit })
      .then((data) => { setItems(data.users || []); setTotal(data.total || 0) })
      .finally(() => setLoading(false))
  }
  useEffect(load, [role, search, page])

  const act = async (fn, id) => { await fn(id); load() }

  return (
    <div>
      <p className="eyebrow">User management</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Users</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <input placeholder="Search users…" className="field-input max-w-xs" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value) }} />
        <select className="field-input max-w-[160px]" value={role} onChange={(e) => { setPage(1); setRole(e.target.value) }}>
          {ROLES.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
        </select>
      </div>

      <div className="mt-6">
        {loading ? <Loader /> : (
          <DataTable
            columns={[
              { key: 'full_name', header: 'Name' },
              { key: 'email', header: 'Email' },
              { key: 'role', header: 'Role', render: (r) => <span className="capitalize">{r.role?.replace('_', ' ')}</span> },
              { key: 'status', header: 'Status', render: (r) => <Badge status={r.is_active ? 'active' : 'blocked'} /> },
              {
                key: 'actions', header: 'Actions', render: (r) => (
                  r.role === 'platform_founder' ? <span className="text-xs text-ink-300">—</span> : (
                    <div className="flex flex-wrap gap-2">
                      {r.is_active ? (
                        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => act(suspendUser, r.id)}>Suspend</button>
                      ) : (
                        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => act(activateUser, r.id)}>Activate</button>
                      )}
                      {r.role === 'admin' && me?.role === 'platform_founder' && (
                        <button className="btn-ghost !px-2 !py-1 text-xs" onClick={() => act(removeAdmin, r.id)}>Remove admin</button>
                      )}
<<<<<<< HEAD
                      {r.role !== 'admin' && me?.role === 'platform_founder' && (
                        <button className="btn-ghost !px-2 !py-1 text-xs text-gold-600" onClick={() => act(makeAdmin, r.id)}>Make admin</button>
                      )}
=======
>>>>>>> d1cca0860ac39149356ef502b0bd42f16f6d9092
                      <button className="btn-ghost !px-2 !py-1 text-xs text-red-500" onClick={() => confirm('Delete this user?') && act(deleteUser, r.id)}>Delete</button>
                    </div>
                  )
                ),
              },
            ]}
            rows={items}
          />
        )}
      </div>
      <Pagination page={page} limit={limit} total={total} onChange={setPage} />
    </div>
  )
}
