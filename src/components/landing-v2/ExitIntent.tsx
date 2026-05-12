'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const SESSION_KEY = 'jo-exit-intent-shown'

export default function ExitIntent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const hasTriggered = useRef(false)
  const mobileTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showPopup = useCallback(() => {
    if (hasTriggered.current) return
    if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_KEY)) return

    hasTriggered.current = true
    setIsClosing(false)
    setIsVisible(true)
  }, [])

  const closePopup = useCallback(() => {
    if (!isVisible) return

    setIsClosing(true)

    const duration = prefersReducedMotion ? 0 : 300
    setTimeout(() => {
      setIsVisible(false)
      setIsClosing(false)
    }, duration)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_KEY, 'true')
    }
  }, [isVisible, prefersReducedMotion])

  const handleCTAClick = useCallback(() => {
    closePopup()

    // Smooth scroll to #contacto after close animation
    const duration = prefersReducedMotion ? 0 : 300
    setTimeout(() => {
      const contactEl = document.getElementById('contacto')
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, duration + 50)
  }, [closePopup, prefersReducedMotion])

  useEffect(() => {
    // Check prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handleMotionChange)

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Check if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      hasTriggered.current = true
    }

    return () => {
      mq.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (hasTriggered.current) return

    if (isMobile) {
      // Mobile: show after 60 seconds
      mobileTimer.current = setTimeout(() => {
        showPopup()
      }, 60000)
    } else {
      // Desktop: exit-intent detection (mouse leaves from top)
      const handleMouseOut = (e: MouseEvent) => {
        if (e.clientY < 10) {
          showPopup()
        }
      }

      document.addEventListener('mouseout', handleMouseOut)

      return () => {
        document.removeEventListener('mouseout', handleMouseOut)
      }
    }

    return () => {
      if (mobileTimer.current) {
        clearTimeout(mobileTimer.current)
      }
    }
  }, [isMobile, showPopup])

  // Prevent body scroll when visible
  useEffect(() => {
    if (isVisible) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isVisible])

  if (!isVisible && !isClosing) return null

  const overlayOpacity = isClosing ? 0 : 1

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: overlayOpacity,
    transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease',
    padding: 20,
  }

  const modalTransform = isClosing
    ? (prefersReducedMotion ? 'none' : 'scale(0.95)')
    : 'scale(1)'
  const modalOpacity = isClosing ? 0 : 1

  const modalStyle: React.CSSProperties = {
    maxWidth: 440,
    width: '90%',
    background: '#111111',
    borderRadius: 12,
    border: '1px solid rgba(245, 240, 232, 0.08)',
    padding: '40px 32px',
    position: 'relative',
    transform: modalTransform,
    opacity: modalOpacity,
    transition: prefersReducedMotion
      ? 'none'
      : 'transform 0.3s ease, opacity 0.3s ease',
  }

  const closeBtnStyle: React.CSSProperties = {
    position: 'absolute',
    top: 16,
    right: 16,
    background: 'none',
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    color: 'rgba(245, 240, 232, 0.3)',
    fontSize: 18,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: prefersReducedMotion ? 'none' : 'color 0.2s ease',
  }

  const emojiStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 1,
    marginBottom: 0,
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.5rem',
    fontWeight: 400,
    color: '#F5F0E8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 1.3,
  }

  const descStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    color: 'rgba(245, 240, 232, 0.5)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 1.6,
  }

  const ctaStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    marginTop: 24,
    padding: '14px 24px',
    background: '#C9A84C',
    color: '#0A0A0A',
    fontFamily: "'Jost', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    borderRadius: 4,
    border: 'none',
    cursor: 'pointer',
    transition: prefersReducedMotion ? 'none' : 'background 0.2s ease, transform 0.2s ease',
    textAlign: 'center',
    textDecoration: 'none',
    lineHeight: 1.5,
  }

  const subtextStyle: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(245, 240, 232, 0.25)',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 1.4,
  }

  return (
    <div
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePopup()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Oferta especial"
    >
      <div style={modalStyle}>
        <button
          style={closeBtnStyle}
          onClick={closePopup}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(245, 240, 232, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(245, 240, 232, 0.3)'
          }}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div style={emojiStyle}>🎁</div>

        <h2 style={titleStyle}>¡Espera! Tenemos algo para ti</h2>

        <p style={descStyle}>
          Agenda tu consulta hoy y recibe un 10% de descuento en cualquier plan.
        </p>

        <button
          style={ctaStyle}
          onClick={handleCTAClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D4B55A'
            if (!prefersReducedMotion) {
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#C9A84C'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Quiero mi descuento
        </button>

        <p style={subtextStyle}>Sin compromiso. Consulta gratuita.</p>
      </div>
    </div>
  )
}
