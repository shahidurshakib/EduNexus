import PageHero from './PageHero'

export default function Vision() {
  return (
    <div>
      <PageHero
        eyebrow="Vision"
        title="A campus where no good idea loses its paper trail."
        description="We imagine a university where a sophomore's research and a senior's startup share one accountable record from day one."
      />
      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="card">
            <p className="eyebrow">The problem today</p>
            <p className="mt-3 text-ink-600 dark:text-ink-300">
              Research sits in one office's spreadsheet. Startup pitches sit in a founder's inbox. Mentors
              volunteer informally. Investors hear about opportunities third-hand. Nothing connects, and
              nothing is verifiable months later.
            </p>
          </div>
          <div className="card border-gold-300 dark:border-gold-700">
            <p className="eyebrow">The record we want instead</p>
            <p className="mt-3 text-ink-600 dark:text-ink-300">
              One verified account per person, one role at a time, one auditable trail from a research
              abstract to a funding round — searchable by anyone the university trusts to look.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
