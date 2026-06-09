'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookingCalendar } from './BookingCalendar'

type Step = 'email' | 'details' | 'calendar' | 'confirmed'

const STEPS: Step[] = ['email', 'details', 'calendar']

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
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, y: -10, filter: 'blur(5px)' },
}
const stepTransition = { type: 'spring' as const, stiffness: 260, damping: 28 }

export function BookingForm() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail]           = useState('')
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [phone, setPhone]           = useState('')
  const [company, setCompany]       = useState('')
  const [emailError, setEmailError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [isBooking, setIsBooking]   = useState(false)
  const [confirmedDate, setConfirmedDate] = useState<Date | null>(null)
  const [confirmedTime, setConfirmedTime] = useState<string | null>(null)
  const [teamsUrl, setTeamsUrl]     = useState<string | null>(null)

  const emailRef = useRef<HTMLInputElement>(null)
  const firstRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'email')   emailRef.current?.focus()
    if (step === 'details') firstRef.current?.focus()
  }, [step])

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) { setEmailError('Please enter a valid work email.'); return }
    setEmailError('')
    setStep('details')
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return
    setStep('calendar')
  }

  const handleConfirm = async (date: Date, time: string) => {
    setIsBooking(true)
    setBookingError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, company, date: toDateKey(date), time }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed. Please try again.')
      setConfirmedDate(date)
      setConfirmedTime(time)
      setTeamsUrl(data.teamsUrl ?? null)
      setStep('confirmed')
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsBooking(false)
    }
  }

  const resetForm = () => {
    setStep('email')
    setEmail(''); setFirstName(''); setLastName('')
    setPhone(''); setCompany(''); setTeamsUrl(null)
    setBookingError('')
  }

  const fullName = `${firstName} ${lastName}`.trim() || 'there'

  const baseInput = {
    className: 'glow-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors',
    style: { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' },
  }

  return (
    <div className="w-full">

      {/* ── Progress dots ── */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done   = step === 'confirmed' || STEPS.indexOf(step) > i
          const active = step === s
          return (
            <motion.div
              key={s}
              animate={{
                width:           active ? 28 : 8,
                backgroundColor: done || active ? 'var(--accent)' : 'var(--border)',
                opacity:         done ? 0.6 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              style={{ height: 4, borderRadius: 99 }}
            />
          )
        })}
      </div>

      {/* ── Heading ── */}
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
          {step === 'confirmed' ? "You’re booked!" : 'Book your demo'}
        </motion.h2>
      </AnimatePresence>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">

        {/* STEP 1 — Email */}
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
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Work email
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError('') }}
                placeholder="you@pharmacy.com"
                autoComplete="email"
                {...baseInput}
                style={{
                  ...baseInput.style,
                  borderColor: emailError ? '#ef4444' : 'var(--border)',
                }}
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-500"
                >
                  {emailError}
                </motion.p>
              )}
            </div>

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

        {/* STEP 2 — Details */}
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
            {/* Locked email row */}
            <div
              className="flex items-center justify-between rounded-xl border px-4 py-2.5"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text)' }}>{email}</span>
              <button type="button" onClick={() => setStep('email')} className="text-xs underline underline-offset-2" style={{ color: 'var(--muted)' }}>
                Change
              </button>
            </div>

            {/* Welcome badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent)', animation: 'dot-pulse 2s ease-in-out infinite' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                Welcome — let&apos;s schedule your call.
              </p>
            </motion.div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { ref: firstRef, value: firstName, onChange: setFirstName, placeholder: 'Priya',   label: 'First name' },
                { ref: undefined, value: lastName,  onChange: setLastName,  placeholder: 'Sharma', label: 'Last name' },
              ].map(({ ref, value, onChange, placeholder, label }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</label>
                  <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    {...baseInput}
                    className="glow-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Phone number</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (312) 847-1928" {...baseInput} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Pharmacy / Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Riverside Pharmacy" {...baseInput} />
            </div>

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

        {/* STEP 3 — Calendar */}
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
                className="mb-3 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-300"
              >
                {bookingError}
              </motion.div>
            )}
            <BookingCalendar onConfirm={handleConfirm} name={fullName} isLoading={isBooking} />
          </motion.div>
        )}

        {/* STEP 4 — Confirmed */}
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
            {/* Animated check */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 }}
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 14%, transparent)',
              }}
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
              className="w-full rounded-xl border p-4 text-left flex flex-col gap-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
            >
              {[
                { icon: <CalIcon />,   label: confirmedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { icon: <ClockIcon />, label: `${to12h(confirmedTime)} · 30 minutes` },
                { icon: <TeamsIcon />, label: teamsUrl ? undefined : 'MS Teams link in your calendar invite', link: teamsUrl ?? undefined },
              ].map(({ icon, label, link }) => (
                <div key={label ?? link} className="flex items-center gap-3 text-sm" style={{ color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--accent)' }}>{icon}</span>
                  {link
                    ? <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent)' }}>Join Microsoft Teams</a>
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
