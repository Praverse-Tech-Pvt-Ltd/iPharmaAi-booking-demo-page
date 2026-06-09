'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/ipharmaai/demo'

export function CalendlyEmbed() {
  const { theme } = useTheme()
  const bgColor = theme === 'dark' ? '131e2e' : 'ffffff'
  const textColor = theme === 'dark' ? 'f0f6fa' : '0f1923'

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const url = `${CALENDLY_URL}?primary_color=1b6b8c&hide_event_type_details=1&hide_gdpr_banner=1&background_color=${bgColor}&text_color=${textColor}`

  return (
    <div
      className="calendly-inline-widget w-full overflow-hidden rounded-xl"
      data-url={url}
      style={{ minWidth: '320px', height: '700px' }}
    />
  )
}
