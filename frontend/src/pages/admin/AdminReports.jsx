import { useState } from 'react'
import { getReport, exportReportUrl } from '../../api/reports'
import DataTable from '../../components/ui/DataTable'
import Loader from '../../components/ui/Loader'

const TYPES = ['startups', 'research', 'funding', 'mentors', 'investors']

export default function AdminReports() {
  const [type, setType] = useState('startups')
  const [rows, setRows] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = (t) => {
    setType(t); setLoading(true)
    getReport(t).then((data) => setRows(data.rows || data[t] || data)).finally(() => setLoading(false))
  }

  const columns = rows && rows[0] ? Object.keys(rows[0]).slice(0, 6).map((k) => ({ key: k, header: k.replace(/_/g, ' ') })) : []

  return (
    <div>
      <p className="eyebrow">Reports & exports</p>
      <h1 className="mt-1 font-display text-3xl font-semibold">Generate a report</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t} onClick={() => load(t)} className={type === t && rows ? 'btn-primary !py-2 capitalize' : 'btn-secondary !py-2 capitalize'}>{t}</button>
        ))}
      </div>

      {rows && (
        <div className="mt-6 flex gap-3">
          {['csv', 'xlsx', 'pdf'].map((f) => (
            <a key={f} href={exportReportUrl(type, f)} target="_blank" rel="noreferrer" className="btn-secondary uppercase">Export {f}</a>
          ))}
        </div>
      )}

      <div className="mt-6 card">
        {loading ? <Loader /> : rows ? (
          <DataTable columns={columns} rows={rows} />
        ) : <p className="text-sm text-ink-400">Choose a report type above to preview it here before exporting.</p>}
      </div>
    </div>
  )
}
