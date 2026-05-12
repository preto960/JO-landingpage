'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ComparisonRow {
  feature: string
  jo: string
  tiendaNube: string
  shopify: string
  whatsapp: string
}

const ROWS: ComparisonRow[] = [
  { feature: 'Tienda online completa', jo: '✅', tiendaNube: '✅', shopify: '✅', whatsapp: '❌' },
  { feature: 'App móvil incluida', jo: '✅', tiendaNube: '❌', shopify: '❌', whatsapp: '❌' },
  { feature: 'Dashboard de gestión', jo: '✅', tiendaNube: 'Básico', shopify: '✅', whatsapp: '❌' },
  { feature: 'Delivery integrado', jo: '✅', tiendaNube: 'Extra', shopify: 'Apps', whatsapp: '❌' },
  { feature: 'Pago único (sin suscripción)', jo: '✅', tiendaNube: '❌', shopify: '❌', whatsapp: '✅' },
  { feature: 'Soporte en español', jo: '✅', tiendaNube: '✅', shopify: 'Limitado', whatsapp: '❌' },
  { feature: 'Personalización total', jo: '✅', tiendaNube: 'Limitada', shopify: '✅', whatsapp: '❌' },
]

const HEADERS = ['JO', 'Tienda Nube', 'Shopify', 'WhatsApp'] as const

function renderCell(value: string): ReactNode {
  if (value === '✅') {
    return (
      <span style={{ color: '#22c55e', fontSize: 14, lineHeight: 1 }}>
        ✅
      </span>
    )
  }
  if (value === '❌') {
    return (
      <span style={{ color: 'rgba(245, 240, 232, 0.15)', fontSize: 14, lineHeight: 1 }}>
        ❌
      </span>
    )
  }
  // Text values like "Básico", "Limitada", "Apps", "Extra"
  return (
    <span
      style={{
        color: 'rgba(245, 240, 232, 0.25)',
        fontSize: 11,
        fontFamily: "'Jost', sans-serif",
      }}
    >
      {value}
    </span>
  )
}

export default function V2Comparison() {
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
        .v2-comparison-table-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-top: 48px;
          border: 1px solid rgba(245, 240, 232, 0.06);
          border-radius: 6px;
        }

        .v2-comparison-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          min-width: 560px;
        }

        .v2-comparison-table thead th {
          background: rgba(201, 168, 76, 0.08);
          border-bottom: 2px solid rgba(201, 168, 76, 0.2);
          padding: 14px 12px;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(245, 240, 232, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
        }

        .v2-comparison-table thead th:first-child {
          text-align: left;
          width: 36%;
        }

        .v2-comparison-table thead th.v2-jo-header {
          color: #C9A84C;
          font-weight: 600;
        }

        .v2-comparison-table tbody tr {
          transition: background 0.2s ease;
        }

        .v2-comparison-table tbody tr:hover {
          background: rgba(245, 240, 232, 0.02);
        }

        .v2-comparison-table tbody td {
          border-bottom: 1px solid rgba(245, 240, 232, 0.05);
          padding: 13px 12px;
          text-align: center;
          vertical-align: middle;
        }

        .v2-comparison-table tbody td:first-child {
          text-align: left;
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: rgba(245, 240, 232, 0.6);
          line-height: 1.4;
        }

        .v2-comparison-table tbody td.v2-jo-cell {
          background: rgba(201, 168, 76, 0.03);
        }

        .v2-comparison-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Mobile card layout */
        .v2-comparison-cards {
          display: none;
          flex-direction: column;
          gap: 16px;
          margin-top: 40px;
        }

        @media (max-width: 639px) {
          .v2-comparison-table-wrapper {
            display: none;
          }

          .v2-comparison-cards {
            display: flex;
          }
        }

        .v2-comparison-card {
          background: rgba(245, 240, 232, 0.02);
          border: 1px solid rgba(245, 240, 232, 0.06);
          border-radius: 6px;
          padding: 16px;
          transition: border-color 0.2s ease;
        }

        .v2-comparison-card:hover {
          border-color: rgba(245, 240, 232, 0.12);
        }

        .v2-comparison-card-feature {
          font-family: 'Jost', sans-serif;
          font-size: 12px;
          color: rgba(245, 240, 232, 0.7);
          font-weight: 500;
          margin: 0 0 12px 0;
        }

        .v2-comparison-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid rgba(245, 240, 232, 0.04);
        }

        .v2-comparison-card-row:last-child {
          border-bottom: none;
        }

        .v2-comparison-card-platform {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          color: rgba(245, 240, 232, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .v2-comparison-card-platform.v2-platform-jo {
          color: #C9A84C;
          font-weight: 600;
        }
      `}</style>

      <section
        id="comparacion"
        ref={sectionRef}
        style={{
          padding: '80px 24px',
          background: '#0c0c0c',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
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
            COMPARACIÓN
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
            JO vs. las alternativas
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              color: 'rgba(245, 240, 232, 0.35)',
              textAlign: 'center',
              margin: '8px 0 0 0',
              lineHeight: 1.6,
            }}
          >
            Mira por qué cientos de negocios eligen JO
          </p>

          {/* Desktop / Tablet — Table */}
          <div className="v2-comparison-table-wrapper">
            <table className="v2-comparison-table">
              <thead>
                <tr>
                  <th>Característica</th>
                  {HEADERS.map((h) => (
                    <th key={h} className={h === 'JO' ? 'v2-jo-header' : undefined}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.feature}</td>
                    <td className="v2-jo-cell">{renderCell(row.jo)}</td>
                    <td>{renderCell(row.tiendaNube)}</td>
                    <td>{renderCell(row.shopify)}</td>
                    <td>{renderCell(row.whatsapp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile — Card layout */}
          <div className="v2-comparison-cards">
            {ROWS.map((row, idx) => (
              <div
                key={idx}
                className="v2-comparison-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + idx * 0.06}s, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + idx * 0.06}s, border-color 0.2s ease`,
                }}
              >
                <p className="v2-comparison-card-feature">{row.feature}</p>
                <div className="v2-comparison-card-row">
                  <span className="v2-comparison-card-platform v2-platform-jo">JO</span>
                  <span>{renderCell(row.jo)}</span>
                </div>
                <div className="v2-comparison-card-row">
                  <span className="v2-comparison-card-platform">Tienda Nube</span>
                  <span>{renderCell(row.tiendaNube)}</span>
                </div>
                <div className="v2-comparison-card-row">
                  <span className="v2-comparison-card-platform">Shopify</span>
                  <span>{renderCell(row.shopify)}</span>
                </div>
                <div className="v2-comparison-card-row">
                  <span className="v2-comparison-card-platform">WhatsApp</span>
                  <span>{renderCell(row.whatsapp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
