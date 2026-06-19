import { CalendlyEmbed } from './CalendlyEmbed'

const benefits = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h4m0-11v11m0 0h4m-4 0a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4M9 14H5a2 2 0 0 1-2-2V8m0 0h18" />
      </svg>
    ),
    title: 'AI-Powered Prescription Management',
    desc: 'Automate refills, detect errors, and process prescriptions faster than ever.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Real-Time Drug Interaction Alerts',
    desc: 'Instant AI-driven alerts protect patients from harmful drug combinations.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: 'Smart Inventory & Demand Forecasting',
    desc: 'Reduce waste and stockouts with predictive inventory analytics.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Seamless EHR & PMS Integration',
    desc: 'Connect with your existing systems in minutes, not months.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'HIPAA-Compliant Data Security',
    desc: 'Enterprise-grade encryption and compliance baked in from day one.',
  },
]

export function HeroSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">

        {/* Left column — value props */}
        <div className="flex flex-col gap-8 lg:w-[55%]">

          {/* Pill */}
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase"
            style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}
          >
            Book a Demo
          </span>

          {/* Heading */}
          <div className="flex flex-col gap-4">
            <h1
              className="text-4xl font-bold leading-tight tracking-tight md:text-5xl"
              style={{ color: 'var(--text)' }}
            >
              See{' '}
              <span style={{ color: 'var(--accent)' }}>Audit Mind</span>
              {' '}in action.
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
              30 minutes with our team. You&apos;ll know in 10 minutes if Audit Mind
              is right for your pharmacy.
            </p>
          </div>

          {/* Benefits */}
          <ul className="flex flex-col gap-5">
            {benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-4">
                <span
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}
                >
                  {b.icon}
                </span>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text)' }}>{b.title}</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div
            className="flex items-center gap-3 rounded-xl border p-4"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    borderColor: 'var(--bg)',
                    backgroundColor: `color-mix(in srgb, var(--accent) ${60 + i * 10}%, #000)`,
                  }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Trusted by <strong style={{ color: 'var(--text)' }}>pharmacies</strong> across the country
            </p>
          </div>
        </div>

        {/* Right column — Calendly */}
        <div className="lg:w-[45%]">
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', boxShadow: '0 8px 40px color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <div className="border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>Schedule your free demo</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Pick a time that works for you</p>
            </div>
            <div className="p-4">
              <CalendlyEmbed />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
