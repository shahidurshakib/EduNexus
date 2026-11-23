export default function ChartCard({ title, subtitle, children, right }) {
  return (
    <div className="card">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="eyebrow">{title}</p>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}
