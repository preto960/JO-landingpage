'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Shared tokens ─── */
const GOLD = '#C9A84C'
const BG = '#0A0A0A'
const FG = '#F5F0E8'
const FG40 = 'rgba(245,240,232,.4)'

/* ─── Step data ─── */
const steps = [
  {
    number: 1,
    title: 'Cuéntanos tu idea',
    description:
      'Nos cuentas qué vendes y cómo es tu negocio. Sin compromiso, sin costo.',
  },
  {
    number: 2,
    title: 'Diseñamos tu tienda',
    description:
      'Creamos tu tienda profesional en menos de 7 días. Verás el diseño antes de lanzar.',
  },
  {
    number: 3,
    title: 'Lanza y vende',
    description:
      'Tu tienda va en vivo con todo configurado: pagos, envíos, inventario.',
  },
  {
    number: 4,
    title: 'Crece con nosotros',
    description:
      'Te acompañamos con soporte, métricas y mejoras continuas.',
  },
]

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

/* ─── Fade-in via IntersectionObserver ─── */
function useStaggeredVisible(count: number, threshold = 0.25) {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const [visible, setVisible] = useState<boolean[]>(
    Array(count).fill(false)
  )

  const setRef = useCallback(
    (idx: number) => (el: HTMLDivElement | null) => {
      refs.current[idx] = el
    },
    []
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.current.indexOf(
            entry.target as HTMLDivElement
          )
          if (idx !== -1 && entry.isIntersecting) {
            setVisible((prev) => {
              const next = [...prev]
              next[idx] = true
              return next
            })
          }
        })
      },
      { threshold }
    )

    refs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [threshold])

  return { setRef, visible }
}

/* ─── Numbered Circle ─── */
function StepCircle({
  number,
  active,
  isVisible,
}: {
  number: number
  active: boolean
  isVisible: boolean
}) {
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: active
          ? `1px solid ${GOLD}`
          : '1px solid rgba(201,168,76,.3)',
        background: active ? 'rgba(201,168,76,.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 18,
        color: GOLD,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(18px)',
        transition: 'opacity .6s ease-out, transform .6s ease-out',
        flexShrink: 0,
      }}
    >
      {number}
    </div>
  )
}

/* ─── Connecting Line ─── */
function ConnectorLine({
  mobile,
  isVisible,
  delay,
}: {
  mobile: boolean
  isVisible: boolean
  delay: number
}) {
  if (mobile) {
    return (
      <div
        style={{
          width: 1,
          height: 40,
          background: 'rgba(201,168,76,.15)',
          margin: '0 auto',
          opacity: isVisible ? 1 : 0,
          transition: `opacity .5s ease-out ${delay}s`,
        }}
      />
    )
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 16,
        height: 1,
        background: 'rgba(201,168,76,.15)',
        alignSelf: 'center',
        opacity: isVisible ? 1 : 0,
        transition: `opacity .5s ease-out ${delay}s`,
      }}
    />
  )
}

/* ─── Single Step ─── */
function Step({
  step,
  active,
  idx,
  setRef,
  isVisible,
}: {
  step: (typeof steps)[number]
  active: boolean
  idx: number
  setRef: (i: number) => (el: HTMLDivElement | null) => void
  isVisible: boolean
}) {
  return (
    <div
      ref={setRef(idx)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity .65s ease-out ${idx * 0.12}s, transform .65s ease-out ${idx * 0.12}s`,
      }}
    >
      <StepCircle
        number={step.number}
        active={active}
        isVisible={isVisible}
      />

      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 14,
          fontWeight: 500,
          color: FG,
          marginTop: 16,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {step.title}
      </p>

      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 12,
          color: FG40,
          lineHeight: 1.6,
          marginTop: 6,
          textAlign: 'center',
          maxWidth: 200,
        }}
      >
        {step.description}
      </p>
    </div>
  )
}

/* ═══════════════════════════════════════════
   V2HowItWorks — Main Export
   ═══════════════════════════════════════════ */
export default function V2HowItWorks({ primary = '#C9A84C' }: { primary?: string } = {}) {
  const mobile = useIsMobile()
  const { setRef, visible } = useStaggeredVisible(steps.length)

  return (
    <section
      id="pasos"
      style={{
        backgroundColor: BG,
        padding: '80px 24px',
        fontFamily: "'Jost', sans-serif",
        boxSizing: 'border-box' as const,
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media (prefers-reduced-motion: reduce) {
  .v2hiw-root, .v2hiw-root * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`,
        }}
      />

      <div
        className="v2hiw-root"
        style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Eyebrow */}
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: '.15em',
            textTransform: 'uppercase' as const,
            color: GOLD,
            textAlign: 'center',
          }}
        >
          CÓMO FUNCIONA
        </span>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem',
            fontWeight: 300,
            color: FG,
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 1.3,
            letterSpacing: '-.01em',
          }}
        >
          De cero a tu tienda online en 4 pasos
        </h2>

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : ('row' as const),
            alignItems: mobile ? 'center' : ('flex-start' as const),
            gap: 0,
            marginTop: 56,
            width: '100%',
            justifyContent: mobile ? 'center' : 'space-between',
          }}
        >
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1

            return (
              <div
                key={step.number}
                style={{
                  display: 'flex',
                  flexDirection: mobile ? 'column' : ('row' as const),
                  alignItems: mobile ? 'center' : ('flex-start' as const),
                }}
              >
                <Step
                  step={step}
                  active={idx === 0}
                  idx={idx}
                  setRef={setRef}
                  isVisible={visible[idx]}
                />

                {!isLast && (
                  <ConnectorLine
                    mobile={mobile}
                    isVisible={visible[idx] && visible[idx + 1]}
                    delay={idx * 0.12 + 0.15}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
