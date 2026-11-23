import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listStartups, getStartupStats } from '../../api/startups'
import { listResearch } from '../../api/research'
import Loader from '../../components/ui/Loader'

const PILLARS = [
  { n: '01', title: 'Register the idea', body: 'A member creates a startup or logs a research project — instantly recorded with a stage, an owner, and a paper trail.' },
  { n: '02', title: 'Attach mentors & investors', body: 'Approved mentors and investors join the record, not a group chat. Every introduction is traceable.' },
  { n: '03', title: 'Track the round', body: 'Funding rounds advance the startup stage automatically — from idea to seed to scale, logged and reportable.' },
]

const RULES = [
  {
    role: 'Mentor',
    eyebrow: 'Mentor guidelines',
    color: 'border-gold-400',
    points: [
      'Review a startup or research proposal in full before accepting a collaboration request.',
      'Respond to member applications with an Approved or Revised decision — never leave one pending indefinitely.',
      'Keep advice and feedback logged on the record, not in private side-channels.',
      'Disclose any conflict of interest before joining a startup as a mentor of record.',
      'Uphold confidentiality on any draft proposal or unpublished research shared for review.',
    ],
  },
  {
    role: 'Investor',
    eyebrow: 'Investor guidelines',
    color: 'border-moss-400',
    points: [
      'Only review applications and proposals submitted by verified, registered members or mentors.',
      'Every decision on a request must be Approved, Revised, or Rejected — with a note when revising.',
      'Log all funding commitments as a formal round against the startup record, not off-platform.',
      'Respect a locked or secured research/proposal document — request access rather than bypass it.',
      'Give founders a clear, specific reason whenever a proposal is sent back for revision.',
    ],
  },
  {
    role: 'Member',
    eyebrow: 'Member guidelines',
    color: 'border-ink-400 dark:border-ink-500',
    points: [
      'Register before applying to a startup, a mentor, or an investor — every action ties back to a verified account.',
      'Keep one authoritative entry per startup or research project; do not duplicate listings.',
      'Submit a complete draft proposal or research paper — incomplete submissions slow down review.',
      'If a submission comes back Revised, update and resubmit rather than opening a new one.',
      'Represent funding needs, authorship, and collaborators accurately at all times.',
    ],
  },
]

function StatCard({ label, value, suffix, accent }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-100 bg-white p-5 shadow-card dark:border-ink-700 dark:bg-ink-800">
      <div className={`absolute inset-x-0 top-0 h-1 origin-left animate-grow-bar ${accent}`} />
      <dt className="text-xs uppercase tracking-wide text-ink-400">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-semibold text-ink-800 dark:text-paper">
        {value ?? '—'}<span className="ml-1 text-base font-normal text-ink-400">{suffix}</span>
      </dd>
    </div>
  )
}

export default function Landing() {
  const [stats, setStats] = useState(null)
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    Promise.allSettled([
      getStartupStats(),
      listResearch({ limit: 1 }),
      listStartups({ limit: 3 }),
    ]).then(([s, r, f]) => {
      setStats({
        running: s.status === 'fulfilled' ? s.value.runningStartups : null,
        total: s.status === 'fulfilled' ? s.value.totalStartups : null,
        research: r.status === 'fulfilled' ? r.value.total : null,
      })
      setFeatured(f.status === 'fulfilled' ? (f.value.startups || []).slice(0, 3) : [])
    })
  }, [])

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-white to-paper dark:border-ink-800 dark:from-ink-900 dark:to-ink-900">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="animate-fade-up">
            <p className="eyebrow">Campus → Company, verified at every step</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Where a lab notebook<br /> becomes a <span className="text-gold-500">term sheet.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-500 dark:text-ink-300">
              EduNexus is the record-keeping backbone for university innovation — one ledger for startups,
              research, mentors and investors, with role-based approval at every hand-off.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">Join EduNexus</Link>
              <Link to="/startups" className="btn-secondary px-6 py-3 text-base">Browse startups</Link>
            </div>

            {/* Infographic stat strip */}
            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-4 font-mono sm:grid-cols-3">
              <StatCard label="Running startups" value={stats?.running} accent="bg-gold-400" />
              <StatCard label="Research records" value={stats?.research} accent="bg-moss-400" />
              <StatCard label="Total ventures" value={stats?.total} accent="bg-ink-400" />
            </dl>
          </div>

          {/* Right-hand visual: real posts linking to investor-facing pages */}
          <div className="relative">
            <div className="card animate-fade-in">
              <p className="eyebrow">Open for investors</p>
              <p className="mt-1 font-display text-lg">Recent startup posts</p>
              {featured.length === 0 ? (
                <p className="mt-4 text-sm text-ink-400">New ventures will appear here as members post them.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {featured.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/startups/${s.id}`}
                        className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3 text-sm transition-colors hover:border-gold-300 hover:bg-gold-50/40 dark:border-ink-700 dark:hover:bg-ink-700/50"
                      >
                        <span>
                          <span className="font-display text-base">{s.name}</span>
                          <span className="ml-2 text-xs text-ink-400">{s.industry}</span>
                        </span>
                        <span className="badge-gold shrink-0">view →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/investors" className="mt-5 inline-block text-sm font-semibold text-gold-600 hover:underline dark:text-gold-400">
                See what investors are reviewing →
              </Link>
            </div>
            <div className="card absolute -bottom-8 -left-8 hidden w-56 -rotate-2 animate-float-slow sm:block">
              <p className="eyebrow">One accountable record</p>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                Every startup, mentor, investor and research entry lives on a single verified profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container-page py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="animate-fade-up">
            <p className="eyebrow">Vision</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              A campus where no good idea loses its paper trail.
            </h2>
            <p className="mt-4 text-ink-500 dark:text-ink-400">
              We imagine a university where a sophomore's research and a senior's startup share one
              accountable record from day one — searchable by anyone the institution trusts to look.
            </p>
            <Link to="/vision" className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:underline dark:text-gold-400">
              Read our vision →
            </Link>
          </div>
          <div className="animate-fade-up [animation-delay:150ms]">
            <p className="eyebrow">Mission</p>
            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              Turn campus activity into an accountable record.
            </h2>
            <p className="mt-4 text-ink-500 dark:text-ink-400">
              Verify before you list. Keep one authoritative record per idea. Make every funding round
              traceable. Report without extra work.
            </p>
            <Link to="/mission" className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:underline dark:text-gold-400">
              Read our mission →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20">
        <p className="eyebrow">How the ledger moves</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Three hand-offs, one record.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div key={p.n} className="animate-fade-up border-t-2 border-gold-400 pt-5" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="font-mono text-sm text-ink-300">{p.n}</span>
              <h3 className="mt-2 font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rules per role */}
      <section className="border-y border-ink-100 bg-ink-800 py-20 text-paper dark:border-ink-800">
        <div className="container-page">
          <p className="eyebrow text-gold-300">Platform rules</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">One record, three sets of responsibilities.</h2>
          <p className="mt-3 max-w-2xl text-ink-300">
            Every role carries its own accountability. These are the ground rules mentors, investors and
            members agree to the moment they apply.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {RULES.map((r, i) => (
              <div key={r.role} className={`animate-fade-up rounded-lg border-t-4 bg-ink-900/60 p-6 ${r.color}`} style={{ animationDelay: `${i * 120}ms` }}>
                <p className="eyebrow text-gold-300">{r.eyebrow}</p>
                <h3 className="mt-2 font-display text-xl">{r.role}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
                  {r.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <span className="mt-1 text-gold-400">›</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
          Your next round starts with a clean record.
        </h2>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">Create an account</Link>
          <Link to="/contact" className="btn-secondary px-6 py-3 text-base">Talk to us</Link>
        </div>
      </section>
    </div>
  )
}
