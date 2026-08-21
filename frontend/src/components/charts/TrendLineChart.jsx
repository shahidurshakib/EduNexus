import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TrendLineChart({ data, xKey, yKey, color = '#d9a441' }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
        <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e5e5e5' }} />
        <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
