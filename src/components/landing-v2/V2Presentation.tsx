'use client'

import V2Nav from './V2Nav'
import V2Hero from './V2Hero'
import V2TrustBar from './V2TrustBar'
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
      {/* Phase 3 sections will be added here:
          V2Problem, V2Services, V2HowItWorks, V2Benefits, V2Comparison
      */}
      {/* Phase 4 sections will be added here:
          V2Testimonials, V2Platforms, V2Pricing, V2FAQ, V2CTA
      */}
      {/* Phase 5 sections will be added here:
          WhatsAppFloat, StickyMobileCTA, SocialProofToast, ExitIntent
      */}
      <V2Footer />
    </div>
  )
}
