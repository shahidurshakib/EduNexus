export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="border-b border-ink-100 bg-white py-16 dark:border-ink-800 dark:bg-ink-900">
      <div className="container-page">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-lg text-ink-500 dark:text-ink-300">{description}</p>}
      </div>
    </section>
  )
}
