'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { BookingForm } from './BookingForm'
import Lightfall from './Lightfall'

const benefits = [
  'AI-powered prescription management & error detection',
  'Real-time drug interaction alerts before dispensing',
  'Smart inventory forecasting — eliminate stockouts',
  'Seamless EHR & PMS integration in days, not months',
  'HIPAA-compliant, enterprise-grade security',
]

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.11, delayChildren: 0.18 },
  },
}
const heroItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 180, damping: 22 },
  },
}

export function SplitLayout() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex min-h-[100dvh] w-full flex-col lg:flex-row">

      {/* ── LEFT PANEL ── */}
      <div
        className="relative flex flex-col overflow-hidden lg:w-[58%] lg:min-h-[100dvh]"
        style={{ backgroundColor: 'var(--left-bg)' }}
      >
        {/* Lightfall background */}
        <div className="pointer-events-none absolute inset-0">
          <Lightfall
            colors={
              theme !== 'dark'
                ? ['#1b6b8c', '#0e4a65', '#2a8aaa']
                : ['#3b9ec0', '#1b6b8c', '#2a8aaa']
            }
            backgroundColor="#0d1623"
            speed={0.4}
            streakCount={1}
            streakWidth={0.7}
            streakLength={1.6}
            glow={theme !== 'dark' ? 1.0 : 0.85}
            density={0.5}
            twinkle={0}
            zoom={2.5}
            backgroundGlow={0}
            opacity={1}
            mouseInteraction={false}
          />
        </div>

        {/* Text-area fade — clears the content zone without killing the edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 75% 65% at 38% 58%, var(--left-bg) 20%, transparent 72%)',
          }}
        />

        {/* Dot-grid overlay */}
        <div className="dot-grid" />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-5">
          <Image
            src={theme === 'dark' ? '/logo-white.png' : '/logo-blue.png'}
            alt="iPharmaAI"
            width={160}
            height={40}
            className="h-9 w-auto object-contain"
            priority
          />

          {/* Theme toggle — pill style */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{
              borderColor: 'var(--left-border)',
              color: 'var(--left-muted)',
              backgroundColor: 'color-mix(in srgb, var(--left-bg) 70%, var(--left-border))',
            }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>

        {/* Hero content */}
        <motion.div
          className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-16 pt-8 lg:px-16 lg:pt-0"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-[420px]">

            {/* Shiny label */}
            <motion.p
              variants={heroItem}
              className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] shiny-text"
            >
              30-minute product walkthrough
            </motion.p>

            {/* Heading */}
            <motion.h1
              variants={heroItem}
              className="mb-5 text-[2.6rem] font-bold leading-[1.08] tracking-tight lg:text-5xl"
              style={{ color: 'var(--left-text)' }}
            >
              See{' '}
              <span
                style={{ color: 'var(--left-accent)' }}
              >
                iPharmaAI
              </span>
              <br />in action.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={heroItem}
              className="mb-8 text-[0.95rem] leading-relaxed"
              style={{ color: 'var(--left-muted)' }}
            >
              Get a full product walkthrough with our team.
              You&apos;ll know in 10 minutes if iPharmaAI is
              right for your pharmacy.
            </motion.p>

            {/* Benefits list */}
            <motion.ul variants={heroItem} className="flex flex-col gap-3">
              {benefits.map((b, i) => (
                <motion.li
                  key={b}
                  custom={i}
                  variants={{
                    hidden: { opacity: 0, x: -14 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        type: 'spring',
                        stiffness: 160,
                        damping: 22,
                        delay: 0.42 + i * 0.09,
                      },
                    },
                  }}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: 'var(--left-muted)' }}
                >
                  <span
                    className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--left-accent) 15%, transparent)',
                    }}
                  >
                    <CheckIcon />
                  </span>
                  {b}
                </motion.li>
              ))}
            </motion.ul>

            {/* Social proof pill */}
            <motion.div
              variants={heroItem}
              className="mt-8 flex w-fit items-center gap-2.5 rounded-full border px-3.5 py-2"
              style={{
                borderColor: 'color-mix(in srgb, var(--left-border) 70%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--left-bg) 60%, transparent)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Tiny avatar stack */}
              <div className="flex -space-x-1.5">
                {['#1b6b8c', '#2a8aaa', '#3b9ec0'].map((c, i) => (
                  <div
                    key={i}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold text-white"
                    style={{ backgroundColor: c, borderColor: 'var(--left-bg)' }}
                  >
                    {['R', 'M', 'A'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--left-accent)',
                    animation: 'dot-pulse 2s ease-in-out infinite',
                  }}
                />
                <p className="text-xs" style={{ color: 'var(--left-muted)' }}>
                  Trusted by <strong style={{ color: 'var(--left-text)' }}>pharmacies</strong> across the country
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div
        className="relative flex flex-col items-center justify-center overflow-hidden px-8 py-14 lg:w-[42%] lg:min-h-[100dvh] lg:px-12"
        style={{ backgroundColor: 'var(--right-bg)' }}
      >
        {/* Bottom vignette */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{
            background: 'linear-gradient(to top, color-mix(in srgb, var(--right-bg) 60%, transparent), transparent)',
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          <BookingForm />
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--left-accent)' }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
