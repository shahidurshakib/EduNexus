import PageHero from './PageHero'

const MISSIONS = [
  ['Verify before you list', 'Every mentor, investor and admin is approved by a human before appearing in a public directory.'],
  ['Keep one record per idea', 'A startup or research entry has exactly one authoritative page — founders, funding and status included.'],
  ['Make funding traceable', 'Every round is logged against a startup and an investor, and automatically advances its stage.'],
  ['Report without extra work', 'Admins export startups, research, funding and people as CSV, Excel or PDF on demand.'],
]

export default function Mission() {
  return (
    <div>
      <PageHero
        eyebrow="Mission"
        title="Turn campus activity into an accountable record."
        description="Four commitments guide how EduNexus is built and how the roles inside it behave."
      />
      <section className="container-page grid gap-6 py-16 sm:grid-cols-2">
        {MISSIONS.map(([title, body], i) => (
          <div key={title} className="card">
            <span className="font-mono text-xs text-gold-500">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 font-display text-xl">{title}</h3>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
