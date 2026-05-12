'use client'

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

/**
 * V2 Presentation — Modern template
 * Assembles all V2 components into a complete landing page
 */
export default function V2Presentation() {
  return (
    <div id="v2-root" style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <V2Nav />
      <V2Hero />
      <V2TrustBar />
      <V2Problem />
      <V2Services />
      <V2HowItWorks />
      <V2Benefits />
      <V2Comparison />
      <V2Testimonials />
      <V2Platforms />
      <V2Pricing />
      <V2FAQ />
      <V2CTA />
      {/* Phase 5 elements will be added here:
          WhatsAppFloat, StickyMobileCTA, SocialProofToast, ExitIntent
      */}
      <V2Footer />
    </div>
  )
}
