'use client'

import { useState, useEffect } from 'react'
import V2Nav from './V2Nav'
import V2Hero from './V2Hero'
import V2TrustBar from './V2TrustBar'
import V2Problem from './V2Problem'
import V2Services from './V2Services'
import V2HowItWorks from './V2HowItWorks'
import V2Benefits from './V2Benefits'
import V2Comparison from './V2Comparison'
import V2Testimonials from './V2Testimonials'
import V2Platforms from './V2Platforms'
import V2Pricing from './V2Pricing'
import V2FAQ from './V2FAQ'
import V2CTA from './V2CTA'
import V2Footer from './V2Footer'
import WhatsAppFloat from './WhatsAppFloat'
import StickyMobileCTA from './StickyMobileCTA'
import ExitIntent from './ExitIntent'

/**
 * V2 Presentation — Modern template
 * Fetches site config for dynamic colors, logo, and section visibility
 */
export default function V2Presentation() {
  const [config, setConfig] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    fetch('/api/site-config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(() => setConfig({}))
  }, [])

  const primary = config?.primary_color || '#C9A84C'
  const secondary = config?.secondary_color || '#60a5fa'
  const logoUrl = config?.site_logo || null
  const showTestimonials = config?.show_testimonials === 'true'

  if (!config) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(201,168,76,.2)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div
      id="v2-root"
      style={{
        background: '#0A0A0A',
        minHeight: '100vh',
        // CSS custom properties for dynamic theming
        '--v2-primary': primary,
        '--v2-secondary': secondary,
        '--v2-logo': logoUrl ? `url(${logoUrl})` : 'none',
      } as React.CSSProperties}
    >
      <V2Nav logoUrl={logoUrl} primary={primary} />
      <V2Hero primary={primary} />
      <V2TrustBar primary={primary} />
      <V2Problem primary={primary} />
      <V2Services primary={primary} />
      <V2HowItWorks primary={primary} />
      <V2Benefits primary={primary} />
      <V2Comparison primary={primary} />
      {showTestimonials && <V2Testimonials primary={primary} />}
      <V2Platforms primary={primary} />
      <V2Pricing primary={primary} />
      <V2FAQ primary={primary} />
      <V2CTA primary={primary} />
      <V2Footer primary={primary} logoUrl={logoUrl} />

      {/* Conversion elements */}
      <WhatsAppFloat primary={primary} />
      <StickyMobileCTA primary={primary} />
      <ExitIntent primary={primary} />

      {/* SocialProofToast removed — no fake data */}
    </div>
  )
}
