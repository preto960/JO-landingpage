'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ProofItem {
  name: string
  city: string
  action: string
  time: string
}

const proofData: ProofItem[] = [
  { name: 'Carlos', city: 'Bogotá', action: 'creó su tienda online', time: 'hace 2 minutos' },
  { name: 'Ana María', city: 'Medellín', action: 'comenzó su prueba gratis', time: 'hace 5 minutos' },
  { name: 'Miguel', city: 'Quito', action: 'activó su plan Profesional', time: 'hace 8 minutos' },
  { name: 'Laura', city: 'Caracas', action: 'creó su tienda de moda', time: 'hace 3 minutos' },
  { name: 'Diego', city: 'Lima', action: 'completó su primera venta', time: 'hace 1 minuto' },
  { name: 'Sofía', city: 'Santiago', action: 'se unió a JO', time: 'hace 10 minutos' },
  { name: 'Roberto', city: 'Panamá', action: 'lanzó su app móvil', time: 'hace 6 minutos' },
  { name: 'Valentina', city: 'Barranquilla', action: 'duplicó sus ventas', time: 'hace 4 minutos' },
  { name: 'Andrés', city: 'Cali', action: 'creó su tienda de deportes', time: 'hace 7 minutos' },
  { name: 'Camila', city: 'Guayaquil', action: 'empezó a vender online', time: 'hace 2 minutos' },
]

function getRandomItem(exclude?: ProofItem): ProofItem {
  if (exclude) {
    const filtered = proofData.filter((item) => item !== exclude)
    return filtered[Math.floor(Math.random() * filtered.length)]
  }
  return proofData[Math.floor(Math.random() * proofData.length)]
}

function getRandomInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const keyframes = `
  @keyframes socialproof-pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
`

export default function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentItem, setCurrentItem] = useState<ProofItem | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closedByUser = useRef(false)

  const showToast = useCallback(() => {
    if (isHidden) return
    const item = getRandomItem(currentItem)
    setCurrentItem(item)
    setIsExiting(false)
    setIsVisible(true)
    closedByUser.current = false

    // Hide after 4 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast()
    }, 4000)
  }, [currentItem, isHidden])

  const hideToast = useCallback(() => {
    setIsExiting(true)

    const exitDuration = prefersReducedMotion ? 0 : 300
    setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)

      // Schedule next toast only if not closed by user
      if (!closedByUser.current) {
        const nextInterval = getRandomInterval(15000, 20000)
        intervalRef.current = setTimeout(() => {
          showToast()
        }, nextInterval)
      }
    }, exitDuration)
  }, [prefersReducedMotion, showToast])

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current)
      intervalRef.current = null
    }

    closedByUser.current = true
    setIsExiting(true)

    const exitDuration = prefersReducedMotion ? 0 : 300
    setTimeout(() => {
      setIsVisible(false)
      setIsExiting(false)

      // Don't show again for 30 seconds after user closes
      intervalRef.current = setTimeout(() => {
        closedByUser.current = false
        showToast()
      }, 30000)
    }, exitDuration)
  }, [prefersReducedMotion, showToast])

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

    // Check if hidden (mobile)
    if (window.innerWidth < 640) {
      setIsHidden(true)
    }

    return () => {
      mq.removeEventListener('change', handleMotionChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return

    // Don't show for the first 5 seconds
    intervalRef.current = setTimeout(() => {
      showToast()
    }, 5000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [isMobile, prefersReducedMotion, showToast])

  // Don't render anything on mobile
  if (isMobile || !currentItem || (!isVisible && !isExiting)) {
    return null
  }

  const enterTransform = prefersReducedMotion ? 'none' : undefined
  const exitTransform = prefersReducedMotion ? 'none' : 'translateX(-100%)'

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 24,
    left: 24,
    zIndex: 997,
    transform: isExiting ? exitTransform : 'translateX(0)',
    opacity: isExiting ? 0 : 1,
    transition: prefersReducedMotion
      ? 'none'
      : isExiting
        ? 'transform 0.3s ease, opacity 0.3s ease'
        : 'transform 0.4s ease, opacity 0.4s ease',
    maxWidth: 300,
    animation: prefersReducedMotion ? 'none' : undefined,
  }

  const innerStyle: React.CSSProperties = {
    background: 'rgba(28, 28, 28, 0.95)',
    border: '1px solid rgba(245, 240, 232, 0.08)',
    borderRadius: 8,
    padding: '12px 16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    position: 'relative',
  }

  const dotContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: 8,
    height: 8,
    minWidth: 8,
    borderRadius: '50%',
    background: '#22c55e',
    marginTop: 4,
  }

  const dotPulseStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#22c55e',
    animation: prefersReducedMotion ? 'none' : 'socialproof-pulse 2s ease-in-out infinite',
  }

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
  }

  const line1Style: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: '#F5F0E8',
    lineHeight: 1.4,
  }

  const line2Style: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontSize: 11,
    fontWeight: 400,
    color: 'rgba(245, 240, 232, 0.4)',
    lineHeight: 1.4,
  }

  const line3Style: React.CSSProperties = {
    fontFamily: 'Jost, sans-serif',
    fontSize: 10,
    fontWeight: 400,
    color: 'rgba(245, 240, 232, 0.25)',
    lineHeight: 1.4,
  }

  const closeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    background: 'none',
    border: 'none',
    padding: 2,
    cursor: 'pointer',
    color: 'rgba(245, 240, 232, 0.2)',
    fontSize: 14,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: prefersReducedMotion ? 'none' : 'color 0.2s ease',
  }

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      <div style={innerStyle}>
        <button
          style={closeStyle}
          onClick={handleClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(245, 240, 232, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(245, 240, 232, 0.2)'
          }}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>

        <div style={dotContainerStyle}>
          <div style={dotPulseStyle} />
        </div>

        <div style={textContainerStyle}>
          <span style={line1Style}>
            {currentItem.name} de {currentItem.city}
          </span>
          <span style={line2Style}>{currentItem.action}</span>
          <span style={line3Style}>{currentItem.time}</span>
        </div>
      </div>
    </div>
  )
}
