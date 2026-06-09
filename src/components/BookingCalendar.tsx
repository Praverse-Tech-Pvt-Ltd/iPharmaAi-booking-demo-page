'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 9; h <= 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 17) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

function to12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  onConfirm: (date: Date, time: string) => void
  name: string
  isLoading?: boolean
}

export function BookingCalendar({ onConfirm, name, isLoading }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [is24h, setIs24h] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set())
  const [availLoading, setAvailLoading] = useState(false)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const isAvailable = (day: number) => {
    const d = new Date(year, month, day)
    const dow = d.getDay()
    return d >= today && dow !== 0 && dow !== 6
  }

  const isToday = (day: number) => new Date(year, month, day).getTime() === today.getTime()
  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === day

  // Fetch availability when selected date changes
  useEffect(() => {
    if (!selectedDate) return
    const dateKey = toDateKey(selectedDate)
    setAvailLoading(true)
    setBookedSlots(new Set())
    fetch(`/api/availability?date=${dateKey}`)
      .then(r => r.json())
      .then(data => {
        if (data.bookedSlots) setBookedSlots(new Set(data.bookedSlots))
      })
      .catch(() => {/* silently ignore — all slots available */})
      .finally(() => setAvailLoading(false))
  }, [selectedDate])

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))
  const canGoPrev = new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1)

  const slots = generateTimeSlots()
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : null

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Host info */}
      <div className="flex items-center gap-3 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>iPharmaAI Demo · 30 min · MS Teams</p>
        </div>
      </div>

      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">
          <span style={{ color: 'var(--text)' }}>{MONTHS[month]}</span>{' '}
          <span style={{ color: 'var(--muted)' }}>{year}</span>
        </span>
        <div className="flex gap-1">
          {[{ fn: prevMonth, icon: <ChevronLeft />, disabled: !canGoPrev }, { fn: nextMonth, icon: <ChevronRight />, disabled: false }].map(({ fn, icon, disabled }, i) => (
            <button
              key={i}
              onClick={fn}
              disabled={disabled}
              className="flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-30"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday headers + day cells */}
      <div className="grid grid-cols-7 gap-0">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold pb-1 tracking-wider" style={{ color: 'var(--muted)' }}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const available = isAvailable(day)
          const selected = isSelected(day)
          const todayMark = isToday(day)
          return (
            <div key={i} className="flex items-center justify-center p-0.5">
              <button
                disabled={!available}
                onClick={() => { setSelectedDate(new Date(year, month, day)); setSelectedTime(null) }}
                className="h-8 w-8 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: selected
                    ? 'var(--text)'
                    : todayMark
                    ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                    : 'transparent',
                  color: selected ? 'var(--bg)' : available ? 'var(--text)' : 'var(--muted)',
                  cursor: available ? 'pointer' : 'default',
                  opacity: available ? 1 : 0.3,
                  fontWeight: todayMark ? '700' : '500',
                }}
                onMouseEnter={e => { if (available && !selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface)' }}
                onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLButtonElement).style.backgroundColor = todayMark ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent' }}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {availLoading ? 'Checking availability…' : selectedLabel}
            </p>
            <div className="flex rounded-full border overflow-hidden text-xs" style={{ borderColor: 'var(--border)' }}>
              {(['12h', '24h'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setIs24h(fmt === '24h')}
                  className="px-2.5 py-0.5 transition-colors"
                  style={{
                    backgroundColor: (fmt === '24h') === is24h ? 'var(--accent)' : 'transparent',
                    color: (fmt === '24h') === is24h ? '#fff' : 'var(--muted)',
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`slots-${selectedDate?.toISOString()}`}
              className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-0.5 custom-scroll"
            >
              {availLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 22 }}
                      className="rounded-lg h-8 animate-pulse"
                      style={{ backgroundColor: 'var(--surface)' }}
                    />
                  ))
                : slots.map((slot, i) => {
                    const booked = bookedSlots.has(slot)
                    const selected = selectedTime === slot
                    return (
                      <motion.button
                        key={slot}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: booked ? 0.4 : 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: 'spring', stiffness: 240, damping: 24 }}
                        whileTap={booked ? {} : { scale: 0.95 }}
                        disabled={booked}
                        onClick={() => setSelectedTime(slot)}
                        className="rounded-lg border py-1.5 text-xs font-medium transition-colors"
                        style={{
                          borderColor: selected ? 'var(--accent)' : 'var(--border)',
                          backgroundColor: selected
                            ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                            : 'transparent',
                          color: booked ? 'var(--muted)' : selected ? 'var(--accent)' : 'var(--text)',
                          cursor: booked ? 'not-allowed' : 'pointer',
                          textDecoration: booked ? 'line-through' : 'none',
                        }}
                      >
                        {is24h ? slot : to12h(slot)}
                      </motion.button>
                    )
                  })}
            </motion.div>
          </AnimatePresence>

          {selectedTime && !isLoading && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => onConfirm(selectedDate, selectedTime)}
              className="shimmer-btn mt-1 w-full rounded-xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Confirm booking — {is24h ? selectedTime : to12h(selectedTime)}
            </motion.button>
          )}

          {isLoading && (
            <div className="mt-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm" style={{ color: 'var(--muted)', backgroundColor: 'var(--surface)' }}>
              <Spinner /> Booking your slot…
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
}
function ChevronRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
}
function Spinner() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
}
