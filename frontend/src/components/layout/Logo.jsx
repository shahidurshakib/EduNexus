export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-semibold ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2 L24 8 L13 14 L2 8 Z" fill="currentColor" opacity="0.9" />
        <path d="M7 11.5 V18 C7 20 9.5 22 13 22 C16.5 22 19 20 19 18 V11.5" stroke="currentColor" strokeWidth="1.6" fill="none" />
      </svg>
      EduNexus
    </span>
  )
}
