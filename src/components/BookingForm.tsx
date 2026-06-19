'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookingCalendar } from './BookingCalendar'

type Step = 'email' | 'details' | 'calendar' | 'confirmed'

const STEPS: Step[] = ['email', 'details', 'calendar']
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Germany']
const SERVICES = [
  '483 Observations',
  'cGMP Six Systems',
  'Investigators',
  'Top 20 Recurring Issues',
  'GMPC Module',
  'Warning Letter',
  'ANDA CTD Smart Template',
  'ANDA Review Checklist',
  'White Paper (Strategic Paper)',
  'Controlled Correspondence',
  'DMF Checklist',
  'Validation Checklist',
  'ANDA Facility Template',
  'API Facility Template',
  'IIG Proportionality',
  'Clearance, Size, Shape & Score Comparison',
]

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const stepVariants = {
  initial: { opacity: 0, y: 14, filter: 'blur(5px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
}
const stepTransition = { type: 'spring' as const, stiffness: 260, damping: 28 }

export function BookingForm() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [mobile, setMobile] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyDomain, setCompanyDomain] = useState('')
  const [service, setService] = useState('')
  const [question, setQuestion] = useState('')
  const [emailError, setEmailError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [confirmedDate, setConfirmedDate] = useState<Date | null>(null)
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null)
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'email') emailRef.current?.focus()
    if (step === 'details') nameRef.current?.focus()
  }, [step])

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid work email.')
      return
    }
    setEmailError('')
    setStep('details')
  }

  const handleDetailsSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const hasRequiredDetails =
      fullName.trim() &&
      country &&
      mobile.trim() &&
      companyName.trim() &&
      companyDomain.trim() &&
      service &&
      question.trim()

    if (!hasRequiredDetails) return
    setStep('calendar')
  }

  const handleConfirm = async (date: Date, time: string) => {
    const nameParts = fullName.trim().split(/\s+/)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts.slice(1).join(' ') || '-'

    setIsBooking(true)
    setBookingError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          fullName,
          email,
          phone: mobile,
          country,
          company: companyName,
          companyDomain,
          service,
          question,
          date: toDateKey(date),
          time,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed. Please try again.')
      setConfirmedDate(date)
      setConfirmedTime(time)
      setMeetingUrl(data.meetingUrl ?? null)
      setStep('confirmed')
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsBooking(false)
    }
  }

  const resetForm = () => {
    setStep('email')
    setEmail('')
    setFullName('')
    setCountry('')
    setMobile('')
    setCompanyName('')
    setCompanyDomain('')
    setService('')
    setQuestion('')
    setMeetingUrl(null)
    setBookingError('')
  }

  const displayName = fullName.trim() || 'there'
  const baseInput = {
    className: 'glow-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors',
    style: { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' },
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = step === 'confirmed' || STEPS.indexOf(step) > i
          const active = step === s
          return (
            <motion.div
              key={s}
              animate={{
                width: active ? 28 : 8,
                backgroundColor: done || active ? 'var(--accent)' : 'var(--border)',
                opacity: done ? 0.6 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ height: 4, borderRadius: 99 }}
            />
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.h2
          key={`heading-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={stepTransition}
          className="mb-1 text-[1.85rem] font-bold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          {step === 'confirmed' ? "You're booked!" : 'Book your demo'}
        </motion.h2>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.form
            key="email"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            onSubmit={handleEmailSubmit}
            className="mt-6 flex flex-col gap-4"
          >
            <Field label="Work email">
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setEmailError('')
                }}
                placeholder="you@pharmacy.com"
                autoComplete="email"
                {...baseInput}
                style={{
                  ...baseInput.style,
                  borderColor: emailError ? '#ef4444' : 'var(--border)',
                }}
              />
            </Field>

            {emailError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500">
                {emailError}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              className="shimmer-btn group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Get Started <ArrowRight />
            </motion.button>

            <p className="text-center text-xs" style={{ color: 'var(--muted)' }}>
              We respect your privacy. By submitting, you agree to our{' '}
              <a href="#" className="underline underline-offset-2 hover:opacity-80" style={{ color: 'var(--muted)' }}>
                privacy policy
              </a>.
            </p>
          </motion.form>
        )}

        {step === 'details' && (
          <motion.form
            key="details"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            onSubmit={handleDetailsSubmit}
            className="mt-6 flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name *">
                <input ref={nameRef} type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required {...baseInput} />
              </Field>

              <Field label="Email *">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required {...baseInput} />
              </Field>

              <Field label="Country *">
                <select value={country} onChange={e => setCountry(e.target.value)} required {...baseInput}>
                  <option value="">Select Country</option>
                  {COUNTRIES.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Mobile Number *">
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Enter mobile number" required {...baseInput} />
              </Field>

              <Field label="Company Name *">
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter company name" required {...baseInput} />
              </Field>

              <Field label="Company Domain *">
                <input type="text" value={companyDomain} onChange={e => setCompanyDomain(e.target.value)} placeholder="Enter company domain" required {...baseInput} />
              </Field>
            </div>

            <Field label="Services *">
              <select value={service} onChange={e => setService(e.target.value)} required {...baseInput}>
                <option value="">Select Service</option>
                {SERVICES.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </Field>

            <Field label="Your Question *">
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Tell us about your requirements..."
                required
                rows={4}
                {...baseInput}
                className="glow-input min-h-24 w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
              />
            </Field>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              className="shimmer-btn group flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Schedule a demo <ArrowRight />
            </motion.button>
          </motion.form>
        )}

        {step === 'calendar' && (
          <motion.div
            key="calendar"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            className="mt-5"
          >
            {bookingError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300"
              >
                {bookingError}
              </motion.div>
            )}
            <BookingCalendar onConfirm={handleConfirm} name={displayName} isLoading={isBooking} />
          </motion.div>
        )}

        {step === 'confirmed' && confirmedDate && confirmedTime && (
          <motion.div
            key="confirmed"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            className="mt-6 flex flex-col items-center gap-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                See you on{' '}
                {confirmedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                {' '}at {to12h(confirmedTime)}
              </p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Invite sent to <strong style={{ color: 'var(--text)' }}>{email}</strong>
              </p>
            </div>

            <div
              className="flex w-full flex-col gap-3 rounded-xl border p-4 text-left"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              {[
                { icon: <CalIcon />, label: confirmedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { icon: <ClockIcon />, label: `${to12h(confirmedTime)} - 30 minutes` },
                { icon: <TeamsIcon />, label: meetingUrl ? undefined : 'Video link in your calendar invite', link: meetingUrl ?? undefined },
              ].map(({ icon, label, link }) => (
                <div key={label ?? link} className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--accent)' }}>{icon}</span>
                  {link
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>Join video call</a>
                    : label}
                </div>
              ))}
            </div>

            <button onClick={resetForm} className="text-sm underline underline-offset-2" style={{ color: 'var(--muted)' }}>
              Book another demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{label}</label>
      {children}
    </div>
  )
}

function ArrowRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function CalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
}

function ClockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
}

function TeamsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
}
