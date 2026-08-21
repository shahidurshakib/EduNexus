import { useEffect, useState } from 'react'
import { listFunding, fundingAnalytics } from '../../api/funding'
import DataTable from '../../components/ui/DataTable'
import Loader from '../../components/ui/Loader'
import Pagination from '../../components/ui/Pagination'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import ChartCard from '../../components/charts/ChartCard'
import TrendLineChart from '../../components/charts/TrendLineChart'
import DistributionBarChart from '../../components/charts/DistributionBarChart'

export default function AdminFunding() {
  const [analytics, setAnalytics] = useState(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 10

  useEffect(() => { fundingAnalytics().then(setAnalytics).catch(() => {}) }, [])
  useEffect(() => {
    setLoading(true)
    listFunding({ page, limit }).then((data) => { setItems(data.rounds || data.funding || []); setTotal(data.total || 0) }).finally(() => setLoading(false))
  }, [page])

  const byRoundType = analytics?.byRoundType || analytics?.totalsByRoundType || []
  const trend = analytics?.monthlyTrend || analytics?.trend || []
  const topStartups = analytics?.topStartups || []

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Funding</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Rounds & analytics</h1>
      </div>

      {analytics && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {trend?.length > 0 && (
              <ChartCard title="12-month funding trend">
                <TrendLineChart data={trend} xKey={trend[0]?.month ? 'month' : 'label'} yKey={trend[0]?.total != null ? 'total' : 'amount'} color="#2f8f82" />
              </ChartCard>
            )}
            {byRoundType?.length > 0 && (
              <ChartCard title="Totals by round type">
                <DistributionBarChart data={byRoundType} xKey={byRoundType[0]?.round_type ? 'round_type' : 'roundType'} yKey={byRoundType[0]?.total != null ? 'total' : 'amount'} />
              </ChartCard>
            )}
          </div>

          {topStartups?.length > 0 && (
            <div className="card">
              <p className="eyebrow mb-4">Top 10 funded startups</p>
              <DataTable
                columns={[
                  { key: 'name', header: 'Startup', render: (r) => r.name || r.startup_name },
                  { key: 'total', header: 'Total raised', render: (r) => `$${Number(r.total || r.total_funding).toLocaleString()}` },
                ]}
                rows={topStartups}
              />
            </div>
          )}
        </>
      )}

      <div className="card">
        <p className="eyebrow mb-4">All funding rounds</p>
        {loading ? <Loader /> : (
          <DataTable
            columns={[
              { key: 'startup', header: 'Startup', render: (r) => r.startup_name || r.startupName },
              { key: 'investor', header: 'Investor', render: (r) => r.investor_name || r.investorName },
              { key: 'amount', header: 'Amount', render: (r) => `$${Number(r.amount).toLocaleString()}` },
              { key: 'round', header: 'Round', render: (r) => <Badge status={r.round_type || r.roundType} /> },
              { key: 'date', header: 'Date', render: (r) => (r.funding_date || r.fundingDate)?.slice(0, 10) },
            ]}
            rows={items}
          />
        )}
        <Pagination page={page} limit={limit} total={total} onChange={setPage} />
      </div>
    </div>
  )
}
