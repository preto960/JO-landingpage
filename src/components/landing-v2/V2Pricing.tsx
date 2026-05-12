'use client'

import { useRef, useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   V2Pricing — Pricing Section
   ═══════════════════════════════════════════════════════════ */

/* ─── Color Tokens ─── */
const GOLD = '#C9A84C'
const BG = '#0c0c0c'
const FG = '#F5F0E8'
const FG50 = 'rgba(245,240,232,.5)'
const FG40 = 'rgba(245,240,232,.4)'
const FG35 = 'rgba(245,240,232,.35)'
const FG25 = 'rgba(245,240,232,.25)'
const FG15 = 'rgba(245,240,232,.15)'
const FG12 = 'rgba(245,240,232,.12)'
const FG06 = 'rgba(245,240,232,.06)'
const FG02 = 'rgba(245,240,232,.02)'
const GREEN = '#22c55e'

/* ─── Responsive <style> tag ─── */
const responsiveCSS = `
  .v2pricing-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    align-items: start;
  }

  @media (max-width: 768px) {
    .v2pricing-cards {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
`

/* ─── Feature type ─── */
interface Feature {
  text: string
  included: boolean
}

/* ─── Plan data ─── */
const plans = [
  {
    name: 'Básico',
    highlighted: false,
    badge: null as string | null,
    price: '$299',
    period: 'pago único',
    description: 'Perfecto para emprendedores que están empezando',
    features: [
      { text: 'Tienda online completa', included: true },
      { text: 'Hasta 100 productos', included: true },
      { text: 'Pasarela de pago integrada', included: true },
      { text: 'Panel de administración', included: true },
      { text: 'Certificado SSL', included: true },
      { text: 'App móvil', included: false },
      { text: 'Marketing avanzado', included: false },
    ] as Feature[],
    cta: 'Comenzar',
    cardBg: FG02,
    cardBorder: `1px solid ${FG06}`,
    priceColor: FG,
    priceWeight: 300 as 300,
    ctaStyle: 'outline' as 'outline' | 'filled',
  },
  {
    name: 'Profesional',
    highlighted: true,
    badge: 'MÁS POPULAR',
    price: '$599',
    period: 'pago único',
    description: 'Para negocios que quieren crecer',
    features: [
      { text: 'Tienda online completa', included: true },
      { text: 'Productos ilimitados', included: true },
      { text: 'Pasarelas de pago (MercadoPago, Wompi, PayU)', included: true },
      { text: 'Dashboard avanzado con métricas', included: true },
      { text: 'App móvil (iOS + Android)', included: true },
      { text: 'Marketing básico (email + redes)', included: true },
      { text: 'Soporte prioritario 24/7', included: true },
    ] as Feature[],
    cta: 'Comenzar',
    cardBg: 'rgba(201,168,76,.05)',
    cardBorder: '2px solid rgba(201,168,76,.4)',
    priceColor: GOLD,
    priceWeight: 400 as 400,
    ctaStyle: 'filled' as 'outline' | 'filled',
  },
  {
    name: 'Enterprise',
    highlighted: false,
    badge: null as string | null,
    price: 'Custom',
    period: 'según necesidad',
    description: 'Para grandes negocios con necesidades personalizadas',
    features: [
      { text: 'Todo de Profesional', included: true },
      { text: 'Multi-tienda', included: true },
      { text: 'API personalizada', included: true },
      { text: 'Integraciones a medida', included: true },
      { text: 'Entrenamiento personalizado', included: true },
      { text: 'Gestor de cuenta dedicado', included: true },
      { text: 'SLA garantizado', included: true },
    ] as Feature[],
    cta: 'Contactar',
    cardBg: FG02,
    cardBorder: `1px solid ${FG06}`,
    priceColor: FG,
    priceWeight: 300 as 300,
    ctaStyle: 'outline' as 'outline' | 'filled',
  },
]

/* ═══════════════════════════════════════════
   PricingCard
   ═══════════════════════════════════════════ */
function PricingCard({
  plan,
  index,
  visible,
}: {
  plan: typeof plans[number]
  index: number
  visible: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        position: 'relative',
        background: plan.cardBg,
        border: plan.cardBorder,
        borderRadius: 10,
        padding: '32px 28px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        transform: visible
          ? `translateY(0) ${plan.highlighted ? 'scale(1.02)' : 'scale(1)'}`
          : `translateY(28px) scale(1)`,
        opacity: visible ? 1 : 0,
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${index * 0.12}s, transform .7s cubic-bezier(.22,1,.36,1) ${index * 0.12}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      {plan.badge && (
        <span
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            transform: 'translateX(-50%)',
            background: GOLD,
            color: '#0A0A0A',
            fontFamily: "'Jost', sans-serif",
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            padding: '4px 16px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
          }}
        >
          {plan.badge}
        </span>
      )}

      {/* Plan Name */}
      <span
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '11px',
          fontWeight: 500,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: plan.highlighted ? GOLD : FG50,
        }}
      >
        {plan.name}
      </span>

      {/* Price */}
      <div style={{ marginTop: 20 }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: plan.price === 'Custom' ? '2rem' : '2.5rem',
            fontWeight: plan.priceWeight,
            color: plan.priceColor,
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
      </div>

      {/* Period */}
      <span
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '11px',
          color: FG35,
          marginTop: 6,
          display: 'block',
        }}
      >
        {plan.period}
      </span>

      {/* Description */}
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '12px',
          color: FG40,
          marginTop: 12,
          lineHeight: 1.6,
          margin: '12px 0 0 0',
        }}
      >
        {plan.description}
      </p>

      {/* Divider */}
      <div
        style={{
          width: '100%',
          height: 1,
          background: plan.highlighted
            ? 'rgba(201,168,76,.12)'
            : FG06,
          margin: '20px 0',
        }}
      />

      {/* Features */}
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          width: '100%',
          textAlign: 'left',
        }}
      >
        {plan.features.map((feature, fi) => (
          <li
            key={fi}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              color: feature.included ? FG50 : FG15,
              lineHeight: '2.2',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: '13px',
                color: feature.included ? GREEN : FG15,
                flexShrink: 0,
                width: 16,
                textAlign: 'center',
                display: 'inline-block',
              }}
            >
              {feature.included ? '✓' : '✗'}
            </span>
            <span style={{ opacity: feature.included ? 1 : 0.5 }}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <div style={{ marginTop: 24, width: '100%' }}>
        {plan.ctaStyle === 'filled' ? (
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              background: hovered ? '#d4b35c' : GOLD,
              color: '#0A0A0A',
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background .25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d4b35c'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = GOLD
            }}
          >
            {plan.cta}
          </button>
        ) : (
          <button
            style={{
              width: '100%',
              padding: '12px 0',
              background: 'transparent',
              color: 'rgba(245,240,232,.6)',
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              border: `1px solid ${FG12}`,
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'border-color .25s ease, color .25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(245,240,232,.25)'
              e.currentTarget.style.color = FG
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = FG12
              e.currentTarget.style.color = 'rgba(245,240,232,.6)'
            }}
          >
            {plan.cta}
          </button>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   V2Pricing — Main Export
   ═══════════════════════════════════════════ */
export default function V2Pricing() {
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
      <style>{responsiveCSS}</style>

      <section
        id="precios"
        ref={sectionRef}
        style={{
          background: BG,
          padding: '80px 24px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition:
            'opacity .8s cubic-bezier(.22,1,.36,1), transform .8s cubic-bezier(.22,1,.36,1)',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
          }}
        >
          {/* ── Eyebrow ── */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '.15em',
              textTransform: 'uppercase',
              color: GOLD,
              textAlign: 'center',
              margin: 0,
            }}
          >
            PRECIOS
          </p>

          {/* ── Title ── */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              fontWeight: 300,
              color: FG,
              textAlign: 'center',
              margin: '12px 0 0 0',
              lineHeight: 1.3,
            }}
          >
            Un plan para cada etapa de tu negocio
          </h2>

          {/* ── Subtitle ── */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '13px',
              color: FG40,
              textAlign: 'center',
              margin: '8px 0 0 0',
              lineHeight: 1.6,
            }}
          >
            Sin sorpresas, sin letra pequeña. Precio único, pago una vez.
          </p>

          {/* ── Cards ── */}
          <div
            className="v2pricing-cards"
            style={{ marginTop: 48 }}
          >
            {plans.map((plan, i) => (
              <PricingCard
                key={plan.name}
                plan={plan}
                index={i}
                visible={visible}
              />
            ))}
          </div>

          {/* ── Bottom note ── */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              color: FG25,
              textAlign: 'center',
              margin: '32px 0 0 0',
              lineHeight: 1.6,
            }}
          >
            Todos los planes incluyen 14 días de garantía de devolución. Sin preguntas.
          </p>
        </div>
      </section>
    </>
  )
}
