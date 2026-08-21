import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

const palette = ['#1f2a4a', '#d9a441', '#2f8f82', '#8391b9', '#c48f2e', '#48a58e']

export default function DistributionBarChart({ data, xKey, yKey }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e5e5' }} />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {data?.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
