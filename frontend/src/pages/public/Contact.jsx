import { useState } from 'react'
import PageHero from './PageHero'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const submit = (e) => {
    e.preventDefault()
    // No public contact endpoint is exposed by the API yet — captured client-side for now.
    setSent(true)
  }

  return (
    <div>
      <PageHero eyebrow="Contact" title="Talk to the EduNexus team." description="Questions about onboarding your department, becoming a mentor, or a partnership — reach out below." />
      <section className="container-page grid gap-12 py-16 lg:grid-cols-2">
        <div className="space-y-6 text-ink-600 dark:text-ink-300">
          <div>
            <p className="eyebrow">Email</p>
            <p className="mt-1">hello@edunexus.example</p>
          </div>
          <div>
            <p className="eyebrow">For mentors & investors</p>
            <p className="mt-1">Register an account and request the mentor or investor role — an admin reviews it within 2 business days.</p>
          </div>
          <div>
            <p className="eyebrow">Office</p>
            <p className="mt-1">Innovation Office, Main Campus</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          {sent ? (
            <div className="py-8 text-center">
              <p className="font-display text-xl text-moss-600 dark:text-moss-400">Message received.</p>
              <p className="mt-2 text-sm text-ink-500">We'll get back to you shortly.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="field-label">Full name</label>
                <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Message</label>
                <textarea required rows={4} className="field-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary w-full">Send message</button>
            </>
          )}
        </form>
      </section>
    </div>
  )
}
