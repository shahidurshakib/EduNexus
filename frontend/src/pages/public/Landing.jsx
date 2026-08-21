import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listStartups } from '../../api/startups'
import { listResearch } from '../../api/research'
import Loader from '../../components/ui/Loader'

const PILLARS = [
  { n: '01', title: 'Register the idea', body: 'A member creates a startup or logs a research project — instantly recorded with a stage, an owner, and a paper trail.' },
  { n: '02', title: 'Attach mentors & investors', body: 'Approved mentors and investors join the record, not a group chat. Every introduction is traceable.' },
  { n: '03', title: 'Track the round', body: 'Funding rounds advance the startup stage automatically — from idea to seed to scale, logged and reportable.' },
]

export default function Landing() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      listStartups({ limit: 1 }),
      listResearch({ limit: 1 }),
    ]).then(([s, r]) => {
      setStats({
        startups: s.status === 'fulfilled' ? s.value.total : null,
        research: r.status === 'fulfilled' ? r.value.total : null,
      })
    })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-ink-100 bg-gradient-to-b from-white to-paper dark:border-ink-800 dark:from-ink-900 dark:to-ink-900">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div>
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
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6 font-mono">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Startups logged</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink-800 dark:text-paper">{stats?.startups ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink-400">Research records</dt>
                <dd className="mt-1 text-2xl font-semibold text-ink-800 dark:text-paper">{stats?.research ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="card rotate-1">
              <p className="eyebrow">Startup record #012</p>
              <p className="mt-2 font-display text-xl">AgriSense</p>
              <p className="mt-1 text-sm text-ink-400">AgriTech · Sylhet</p>
              <div className="mt-4 flex gap-2">
                <span className="badge-moss">seed</span>
                <span className="badge-gold">2 mentors</span>
              </div>
              <div className="mt-5 h-px bg-ink-100 dark:bg-ink-700" />
              <p className="mt-4 font-mono text-xs text-ink-400">funding to date</p>
              <p className="font-display text-2xl text-gold-500">$35,000</p>
            </div>
            <div className="card absolute -bottom-8 -left-8 hidden w-56 -rotate-2 sm:block">
              <p className="eyebrow">Verified ✓</p>
              <p className="mt-2 text-sm text-ink-500">OTP-verified accounts only. No anonymous listings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20">
        <p className="eyebrow">How the ledger moves</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Three hand-offs, one record.</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="border-t-2 border-gold-400 pt-5">
              <span className="font-mono text-sm text-ink-300">{p.n}</span>
              <h3 className="mt-2 font-display text-xl">{p.title}</h3>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="border-y border-ink-100 bg-ink-800 py-20 text-paper dark:border-ink-800">
        <div className="container-page">
          <p className="eyebrow text-gold-300">Five roles, one platform</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Built for every seat at the table.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Founder', 'Runs the platform, approves admins.'],
              ['Admin', 'Reviews mentors, investors, keeps records clean.'],
              ['Mentor', 'Guides assigned startups toward funding-ready.'],
              ['Investor', 'Tracks a portfolio and records rounds.'],
              ['Member', 'Registers a startup or a research project.'],
            ].map(([role, desc]) => (
              <div key={role} className="rounded-lg border border-ink-700 p-5">
                <p className="font-display text-lg text-gold-300">{role}</p>
                <p className="mt-2 text-sm text-ink-300">{desc}</p>
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
