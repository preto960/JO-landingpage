'use client'

import { useState, useEffect, useCallback } from 'react'

/* ─── CSS ─── */
const css = `
@keyframes stickyCtaSlideUp {
  0%   { transform: translateY(100%); }
  100% { transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .sticky-cta-bar,
  .sticky-cta-bar * {
    animation: none !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`

export default function StickyMobileCTA({ primary = '#C9A84C' }: { primary?: string } = {}) {
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [show, setShow] = useState(false)
  const [hovered, setHovered] = useState(false)

  /* ── Track scroll position to detect hero pass ── */
  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerHeight * 0.7
      setScrolledPastHero(window.scrollY > threshold)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Delay entrance by 2 seconds after hero is passed ── */
  useEffect(() => {
    if (!scrolledPastHero) {
      setShow(false)
      return
    }
    const timer = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(timer)
  }, [scrolledPastHero])

  /* ── Smooth scroll to #contacto ── */
  const handleClick = useCallback(() => {
    const target = document.getElementById('contacto')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const barStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    zIndex: 998,
    height: '56px',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(245, 240, 232, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    /* Only visible on mobile (max-width: 768px) */
    /* On desktop this is hidden via media query below —
       but since we can't do @media in inline styles alone,
       we use a <style> block injected conditionally */
    opacity: show ? 1 : 0,
    pointerEvents: show ? 'auto' : 'none',
    animation: show
      ? 'stickyCtaSlideUp 0.3s ease forwards'
      : 'none',
    /* Default: hide on desktop via JS media-query check */
  }

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: hovered ? '#D4B85C' : '#C9A84C',
    color: '#0A0A0A',
    fontFamily: "'Jost', sans-serif",
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '10px 24px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    WebkitTapHighlightColor: 'transparent',
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${css}
/* Only show the sticky CTA on mobile */
@media (min-width: 769px) {
  .sticky-cta-bar {
    display: none !important;
  }
}`,
        }}
      />

      <div className="sticky-cta-bar" style={barStyle}>
        <button
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={buttonStyle}
        >
          Cotiza Gratis
        </button>
      </div>
    </>
  )
}
