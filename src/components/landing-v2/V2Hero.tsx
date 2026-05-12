'use client'

import { useState, useEffect } from 'react'

/* ─── Animated entrance ─── */
const keyframes = `
@keyframes v2heroFadeUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes v2heroFadeUpLaptop {
  from { opacity: 0; transform: perspective(1000px) rotateY(-5deg) translateY(36px); }
  to   { opacity: 1; transform: perspective(1000px) rotateY(-5deg) translateY(0); }
}
@keyframes v2heroFadeUpPhone {
  from { opacity: 0; transform: translateY(20px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes v2heroGlowPulse {
  0%, 100% { opacity: .55; }
  50%      { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

/* ─── Shared tokens ─── */
const GOLD = '#C9A84C'
const BG   = '#0A0A0A'
const FG   = '#F5F0E8'
const FG5  = 'rgba(245,240,232,.5)'
const FG35 = 'rgba(245,240,232,.35)'
const FG12 = 'rgba(245,240,232,.12)'
const FG6  = 'rgba(245,240,232,.6)'

/* ─── Responsive hook ─── */
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [breakpoint])
  return mobile
}

/* ─── Inline media-query helper (nested object) ─── */
const mq = (mobile: boolean) => ({
  container: {
    minHeight: '100vh',
    width: '100%',
    background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,.04) 0%, transparent 60%), ${BG}`,
    fontFamily: "'Jost', sans-serif",
    color: FG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: mobile ? '80px 20px 60px' : '100px 48px 80px',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,

  inner: {
    display: 'flex',
    flexDirection: mobile ? 'column' as const : 'row' as const,
    alignItems: mobile ? 'center' as const : 'center' as const,
    gap: mobile ? '48px' : '0',
    maxWidth: '1240px',
    width: '100%',
    margin: '0 auto',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  leftCol: {
    flex: mobile ? 'none' : '0 0 55%',
    maxWidth: mobile ? '100%' : '55%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: mobile ? 'center' as const : 'flex-start' as const,
    textAlign: mobile ? 'center' as const : 'left' as const,
    animation: 'v2heroFadeUp .85s ease-out both',
  } as React.CSSProperties,

  rightCol: {
    flex: mobile ? 'none' : '0 0 45%',
    maxWidth: mobile ? '100%' : '45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    animation: `v2heroFadeUpLaptop .95s ease-out .2s both`,
  } as React.CSSProperties,
})

/* ─── Eyebrow ─── */
function Eyebrow() {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '.15em',
        textTransform: 'uppercase' as const,
        color: GOLD,
        marginBottom: '20px',
      }}
    >
      IMPULSA TU NEGOCIO EN LÍNEA
    </span>
  )
}

/* ─── Headline ─── */
function Headline({ mobile }: { mobile: boolean }) {
  return (
    <h1
      style={{
        fontSize: mobile ? '2.2rem' : '3.5rem',
        fontWeight: 300,
        lineHeight: 1.15,
        color: FG,
        margin: '0 0 20px',
        letterSpacing: '-.01em',
      }}
    >
      Tu tienda online lista para vender en 14 días
    </h1>
  )
}

/* ─── Subtitle ─── */
function Subtitle({ mobile }: { mobile: boolean }) {
  return (
    <p
      style={{
        fontSize: '1.05rem',
        lineHeight: 1.7,
        color: FG5,
        maxWidth: mobile ? '100%' : '480px',
        margin: '0 0 32px',
      }}
    >
      Creamos tu tienda online, app móvil y dashboard de gestión. Todo lo que
      necesitas para vender más, sin complicaciones.
    </p>
  )
}

/* ─── CTA Buttons ─── */
function CTAButtons({ mobile }: { mobile: boolean }) {
  const btnBase: React.CSSProperties = {
    padding: '14px 32px',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '.08em',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all .25s ease',
    border: 'none',
    fontFamily: "'Jost', sans-serif",
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: mobile ? 'wrap' : 'nowrap' as const,
        justifyContent: mobile ? 'center' : 'flex-start',
      }}
    >
      {/* Primary */}
      <button
        style={{
          ...btnBase,
          background: GOLD,
          color: BG,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#d4b35a'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = GOLD
        }}
      >
        Comienza Gratis
      </button>

      {/* Ghost */}
      <button
        style={{
          ...btnBase,
          background: 'transparent',
          border: `1px solid ${FG12}`,
          color: FG6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = GOLD
          e.currentTarget.style.color = FG
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = FG12
          e.currentTarget.style.color = FG6
        }}
      >
        Ver cómo funciona
      </button>
    </div>
  )
}

/* ─── Trust Badges ─── */
function TrustBadges({ mobile }: { mobile: boolean }) {
  const badge: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    letterSpacing: '.05em',
    color: FG35,
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        marginTop: '32px',
        flexWrap: 'wrap',
        justifyContent: mobile ? 'center' : 'flex-start',
        animation: 'v2heroFadeUp .85s ease-out .45s both',
      }}
    >
      {/* Store */}
      <span style={badge}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        350+ negocios
      </span>

      {/* Stars */}
      <span style={badge}>
        <span style={{ color: GOLD, fontSize: '12px' }}>★★★★★</span>
        4.9
      </span>

      {/* Support */}
      <span style={badge}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        Soporte 24/7
      </span>
    </div>
  )
}

/* ─── Laptop Mockup ─── */
function LaptopMockup({ mobile }: { mobile: boolean }) {
  const chrome: React.CSSProperties = {
    height: '28px',
    background: '#1A1A1A',
    borderRadius: '10px 10px 0 0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: '6px',
    flexShrink: 0,
  }

  const dot = (color: string): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  })

  const urlBar: React.CSSProperties = {
    flex: 1,
    height: '14px',
    background: '#111',
    borderRadius: '4px',
    marginLeft: '8px',
    maxWidth: '240px',
  }

  const body: React.CSSProperties = {
    flex: 1,
    background: '#111111',
    padding: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '12px',
    alignContent: 'start',
  }

  const productCard: React.CSSProperties = {
    background: '#1A1A1A',
    borderRadius: '6px',
    overflow: 'hidden',
  }

  const productImg: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1',
    background: '#222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  }

  const productInfo: React.CSSProperties = {
    padding: '6px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  }

  const productBar: (w: string) => React.CSSProperties = (w) => ({
    height: '4px',
    borderRadius: '2px',
    background: '#2A2A2A',
    width: w,
  })

  const navBar: React.CSSProperties = {
    height: '32px',
    background: '#161616',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    gap: '16px',
    flexShrink: 0,
  }

  const navItem: (w: string) => React.CSSProperties = (w) => ({
    height: '5px',
    borderRadius: '3px',
    background: '#2A2A2A',
    width: w,
  })

  const laptopWrap: React.CSSProperties = {
    width: '100%',
    maxWidth: mobile ? '360px' : '480px',
    background: '#161616',
    borderRadius: '10px',
    border: '1px solid #222',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: mobile ? '260px' : '320px',
    boxShadow: '0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)',
    transform: mobile ? 'none' : 'perspective(1000px) rotateY(-5deg)',
  }

  return (
    <div style={laptopWrap}>
      {/* Browser chrome */}
      <div style={chrome}>
        <span style={dot('#FF5F57')} />
        <span style={dot('#FFBD2E')} />
        <span style={dot('#28CA41')} />
        <div style={urlBar} />
      </div>

      {/* Navigation bar */}
      <div style={navBar}>
        <span style={navItem('40px')} />
        <span style={navItem('50px')} />
        <span style={navItem('30px')} />
        <span style={navItem('46px')} />
      </div>

      {/* Store content */}
      <div style={body}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={productCard}>
            <div style={productImg}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div style={productInfo}>
              <span style={productBar('60%')} />
              <span style={productBar('40%')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Phone Mockup ─── */
function PhoneMockup({ mobile }: { mobile: boolean }) {
  if (mobile) return null

  const phone: React.CSSProperties = {
    width: '140px',
    height: '280px',
    background: '#161616',
    borderRadius: '18px',
    border: '1px solid #222',
    position: 'absolute' as const,
    bottom: '-16px',
    right: '0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 30px 60px rgba(0,0,0,.45)',
    animation: 'v2heroFadeUpPhone .9s ease-out .55s both',
    zIndex: 2,
  }

  const notch: React.CSSProperties = {
    width: '50px',
    height: '6px',
    background: '#0A0A0A',
    borderRadius: '3px',
    margin: '8px auto 6px',
    flexShrink: 0,
  }

  const screen: React.CSSProperties = {
    flex: 1,
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }

  const card: React.CSSProperties = {
    background: '#1A1A1A',
    borderRadius: '6px',
    overflow: 'hidden',
  }

  const thumb: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1.3',
    background: '#222',
  }

  const info: React.CSSProperties = {
    padding: '5px 6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  }

  const bar: (w: string) => React.CSSProperties = (w) => ({
    height: '3px',
    borderRadius: '2px',
    background: '#2A2A2A',
    width: w,
  })

  return (
    <div style={phone}>
      <div style={notch} />
      <div style={screen}>
        {/* mini nav */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
          <span style={{ ...bar('28px'), height: '4px' }} />
          <span style={{ ...bar('20px'), height: '4px' }} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} style={card}>
            <div style={thumb} />
            <div style={info}>
              <span style={bar('55%')} />
              <span style={bar('35%')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   V2Hero — Main Export
   ═══════════════════════════════════════════ */
export default function V2Hero() {
  const mobile = useIsMobile()
  const styles = mq(mobile)

  return (
    <section style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      <div style={styles.inner}>
        {/* ── Left Column ── */}
        <div style={styles.leftCol}>
          <Eyebrow />
          <Headline mobile={mobile} />
          <Subtitle mobile={mobile} />
          <CTAButtons mobile={mobile} />
          <TrustBadges mobile={mobile} />
        </div>

        {/* ── Right Column ── */}
        <div style={styles.rightCol}>
          {/* Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '10%',
              width: '80%',
              height: '80%',
              background:
                'radial-gradient(ellipse at center, rgba(201,168,76,.10) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0,
              animation: 'v2heroGlowPulse 6s ease-in-out infinite',
            }}
          />

          {/* Laptop */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <LaptopMockup mobile={mobile} />
          </div>

          {/* Phone */}
          <PhoneMockup mobile={mobile} />
        </div>
      </div>
    </section>
  )
}
