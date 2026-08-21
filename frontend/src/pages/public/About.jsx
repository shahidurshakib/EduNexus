import PageHero from './PageHero'

export default function About() {
  return (
    <div>
      <PageHero
        eyebrow="About EduNexus"
        title="A record-keeping layer for university innovation."
        description="EduNexus started as a question: why does a research paper and a startup pitch live in two different systems, reviewed by two different offices, with no shared history?"
      />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 text-ink-600 dark:text-ink-300">
          <p>
            We built EduNexus as the connective ledger between a university's research output and the
            startups that grow out of it. A founder's role_approval, a mentor's assigned startup, an
            investor's funding round — each is one row in one system, visible to the people who are
            actually accountable for it.
          </p>
          <p>
            The platform enforces a simple chain of trust: a platform founder account seeds the system,
            admins are approved by the founder, and mentors and investors are approved by admins before
            they appear anywhere public. Nothing is listed until someone with authority has signed off on it.
          </p>
          <p>
            Every startup carries its founders, mentors, investors and funding history in one place.
            Every research record carries its authors and any resulting patents. The result is a single
            source of truth that a founder, an admin, or an accreditation committee can all read the same way.
          </p>
        </div>
        <aside className="card h-fit">
          <p className="eyebrow">At a glance</p>
          <ul className="mt-4 space-y-3 text-sm text-ink-500 dark:text-ink-400">
            <li><span className="font-semibold text-ink-800 dark:text-paper">5</span> platform roles</li>
            <li><span className="font-semibold text-ink-800 dark:text-paper">OTP</span> verified registration</li>
            <li><span className="font-semibold text-ink-800 dark:text-paper">Auto-tracked</span> funding stages</li>
            <li><span className="font-semibold text-ink-800 dark:text-paper">Full</span> activity & login logs</li>
          </ul>
        </aside>
      </section>
    </div>
  )
}
