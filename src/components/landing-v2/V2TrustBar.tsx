'use client'

import { useEffect, useRef, useState } from 'react'

const INTEGRATIONS = [
  'MercadoPago',
  'Wompi',
  'PayU',
  'Stripe',
  'WhatsApp',
  'Instagram',
  'Google',
] as const

export default function V2TrustBar({ primary = '#C9A84C' }: { primary?: string } = {}) {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(el)

    return () => {
      observer.unobserve(el)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '40px 24px',
        background: 'rgba(245, 240, 232, 0.015)',
        borderTop: '1px solid rgba(245, 240, 232, 0.04)',
        borderBottom: '1px solid rgba(245, 240, 232, 0.04)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Top label */}
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '10px',
          color: 'rgba(245, 240, 232, 0.3)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
          margin: 0,
          marginBottom: '28px',
        }}
      >
        USADO POR +350 NEGOCIOS EN LATINOAMÉRICA
      </p>

      {/* Integration logos row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
        }}
      >
        {INTEGRATIONS.map((name, idx) => (
          <span
            key={name}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '13px',
                color: 'rgba(245, 240, 232, 0.2)',
                letterSpacing: '0.05em',
                fontWeight: 400,
                cursor: 'default',
                padding: '6px 12px',
                borderRadius: '4px',
                transition: 'color 0.3s ease, background 0.3s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget
                target.style.color = 'rgba(245, 240, 232, 0.4)'
                target.style.background = 'rgba(245, 240, 232, 0.03)'
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget
                target.style.color = 'rgba(245, 240, 232, 0.2)'
                target.style.background = 'transparent'
              }}
            >
              {name}
            </span>

            {idx < INTEGRATIONS.length - 1 && (
              <span
                aria-hidden="true"
                style={{
                  color: 'rgba(245, 240, 232, 0.08)',
                  fontSize: '13px',
                  lineHeight: 1,
                  userSelect: 'none',
                  padding: '0 4px',
                }}
              >
                •
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Bottom caption */}
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '11px',
          color: 'rgba(245, 240, 232, 0.2)',
          textAlign: 'center',
          margin: '16px 0 0 0',
          lineHeight: '1.6',
        }}
      >
        Integraciones con las principales plataformas de pago y redes sociales
      </p>
    </section>
  )
}
