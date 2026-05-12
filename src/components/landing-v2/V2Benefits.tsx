'use client'

import { useEffect, useRef, useState } from 'react'

const BENEFITS = [
  {
    emoji: '🚀',
    title: 'Lanzamiento rápido',
    description: 'Tu tienda lista en 14 días o menos. Sin largos procesos de desarrollo.',
  },
  {
    emoji: '💰',
    title: 'Precio transparente',
    description: 'Sin costos ocultos. Paga una sola vez y es tuya para siempre.',
  },
  {
    emoji: '📱',
    title: '100% Responsivo',
    description: 'Se ve perfecto en cualquier dispositivo: móvil, tablet y desktop.',
  },
  {
    emoji: '🔒',
    title: 'Seguridad garantizada',
    description: 'Datos protegidos con encriptación SSL y cumplimiento de normativas.',
  },
  {
    emoji: '📈',
    title: 'Escalable',
    description: 'Crece sin límites. Tu plataforma crece a la par de tu negocio.',
  },
  {
    emoji: '🎧',
    title: 'Soporte dedicado',
    description: 'Equipo de soporte disponible cuando lo necesites. No estás solo.',
  },
] as const

export default function V2Benefits() {
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
      { threshold: 0.1 },
    )

    observer.observe(el)

    return () => {
      observer.unobserve(el)
    }
  }, [])

  return (
    <>
      <style>{`
        .v2-benefits-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .v2-benefits-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 960px) {
          .v2-benefits-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .v2-benefit-card {
          background: rgba(245, 240, 232, 0.02);
          border: 1px solid rgba(245, 240, 232, 0.06);
          border-radius: 6px;
          padding: 24px;
          cursor: default;
          transition: border-color 0.3s ease, transform 0.3s ease;
        }

        .v2-benefit-card:hover {
          border-color: rgba(201, 168, 76, 0.15);
          transform: translateY(-2px);
        }
      `}</style>

      <section
        id="beneficios"
        ref={sectionRef}
        style={{
          padding: '80px 24px',
          background: '#0A0A0A',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {/* Eyebrow */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              color: '#C9A84C',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            ¿POR QUÉ JO?
          </p>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              color: '#F5F0E8',
              fontWeight: 300,
              textAlign: 'center',
              margin: '12px 0 0 0',
              lineHeight: 1.3,
            }}
          >
            Las ventajas que hacen la diferencia
          </h2>

          {/* Cards Grid */}
          <div
            className="v2-benefits-grid"
            style={{
              marginTop: 48,
            }}
          >
            {BENEFITS.map((benefit, idx) => (
              <div
                key={idx}
                className="v2-benefit-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.08}s, border-color 0.3s ease, transform 0.3s ease`,
                }}
              >
                {/* Emoji icon */}
                <span
                  style={{
                    fontSize: 28,
                    lineHeight: 1,
                    display: 'block',
                  }}
                  role="img"
                  aria-label={benefit.title}
                >
                  {benefit.emoji}
                </span>

                {/* Card title */}
                <h3
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '13px',
                    color: '#F5F0E8',
                    fontWeight: 500,
                    margin: '12px 0 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {benefit.title}
                </h3>

                {/* Card description */}
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    color: 'rgba(245, 240, 232, 0.35)',
                    lineHeight: 1.7,
                    margin: '6px 0 0 0',
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
