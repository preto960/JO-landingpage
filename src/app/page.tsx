'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import JOPresentation from '@/components/JOPresentation'

// Dynamic import for V2 template (avoid loading both at once)
const V2Presentation = dynamic(() => import('@/components/landing-v2/V2Presentation'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '2px solid rgba(201,168,76,.2)',
        borderTopColor: '#C9A84C',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  ),
})

export default function Home() {
  const [template, setTemplate] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/site-config?key=template')
      .then(res => res.json())
      .then(data => setTemplate(data.value || 'v1-luxury'))
      .catch(() => setTemplate('v1-luxury'))
  }, [])

  // Show nothing (or a loader) until we know which template to use
  if (template === null) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid rgba(201,168,76,.2)',
          borderTopColor: '#C9A84C',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (template === 'v2-modern') {
    return <V2Presentation />
  }

  return <JOPresentation />
}
