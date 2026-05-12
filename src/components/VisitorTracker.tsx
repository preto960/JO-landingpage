'use client'

import { useEffect } from 'react'

export default function VisitorTracker() {
  useEffect(() => {
    // Don't log if user is logged in as admin
    try {
      const stored = localStorage.getItem('next-auth.session-token') ||
        localStorage.getItem('authjs.session-token')
      if (stored) return
    } catch {}

    const sendLog = async () => {
      try {
        await fetch('/api/visitors/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: window.location.pathname,
            referer: document.referrer || null,
            userAgent: navigator.userAgent,
          }),
        })
      } catch {
        // Silently fail - don't disrupt the user experience
      }
    }

    sendLog()
  }, [])

  return null
}
