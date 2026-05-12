'use client'

import { useRef, useEffect, useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   V2Services — Services Section
   ═══════════════════════════════════════════════════════════ */

/* ─── Color Tokens ─── */
const GOLD = '#C9A84C'
const BG = '#0A0A0A'
const FG = '#F5F0E8'
const FG40 = 'rgba(245,240,232,.4)'
const FG12 = 'rgba(245,240,232,.12)'

/* ─── Responsive <style> tag ─── */
const responsiveCSS = `
  .v2svc-row {
    display: flex;
    gap: 40px;
    align-items: center;
    flex-direction: row;
  }
  .v2svc-row.even {
    flex-direction: row-reverse;
  }
  .v2svc-row .v2svc-text,
  .v2svc-row .v2svc-mockup {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 768px) {
    .v2svc-row,
    .v2svc-row.even {
      flex-direction: column;
      gap: 28px;
    }
  }
`

/* ─── Service Data ─── */
const services = [
  {
    title: 'Tienda Online',
    desc: 'Tu tienda profesional lista para vender 24/7. Catálogo de productos, carrito, pasarelas de pago y gestión de pedidos.',
    badge: 'POPULAR' as const,
  },
  {
    title: 'App Móvil',
    desc: 'Tu tienda en el bolsillo de tus clientes. App nativa para iOS y Android con notificaciones push.',
    badge: 'NUEVO' as const,
  },
  {
    title: 'Dashboard Admin',
    desc: 'Panel de control completo. Gestiona productos, pedidos, clientes y métricas en tiempo real.',
    badge: null,
  },
  {
    title: 'Delivery',
    desc: 'Gestión de envíos integrada. Tracking en tiempo real para ti y tus clientes.',
    badge: 'NUEVO' as const,
  },
  {
    title: 'Marketing Digital',
    desc: 'Herramientas de marketing integradas. Redes sociales, email marketing y promociones automáticas.',
    badge: null,
  },
  {
    title: 'Métricas y Reportes',
    desc: 'Datos que importan. Reportes de ventas, análisis de clientes y KPIs para tomar mejores decisiones.',
    badge: null,
  },
]

/* ═══════════════════════════════════════════
   MOCKUP 1 — Tienda Online (Browser)
   ═══════════════════════════════════════════ */
function MockupTiendaOnline() {
  const dot = (c: string): React.CSSProperties => ({
    width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0,
  })
  const bar = (w: string, h = 4): React.CSSProperties => ({
    height: h, borderRadius: 2, background: '#2A2A2A', width: w,
  })

  return (
    <div style={{
      width: '100%', maxWidth: 420, background: '#141414', borderRadius: 10,
      border: '1px solid #222', overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,.45)',
    }}>
      {/* Chrome */}
      <div style={{
        height: 28, background: '#1A1A1A', borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
      }}>
        <span style={dot('#FF5F57')} />
        <span style={dot('#FFBD2E')} />
        <span style={dot('#28CA41')} />
        <div style={{
          flex: 1, height: 13, background: '#111', borderRadius: 4,
          marginLeft: 8, maxWidth: 220,
        }} />
        {/* Cart icon */}
        <div style={{
          width: 22, height: 22, borderRadius: 4, background: 'rgba(201,168,76,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        height: 32, background: '#161616', display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 14,
      }}>
        <span style={{ ...bar(36, 5), background: GOLD, opacity: .6 }} />
        <span style={bar(48)} />
        <span style={bar(32)} />
        <span style={bar(42)} />
      </div>

      {/* Product Grid */}
      <div style={{
        padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ background: '#1A1A1A', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{
              width: '100%', aspectRatio: '1', background: `linear-gradient(135deg, #1e1e1e ${30 + i * 5}%, #252525)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={bar(`${55 + (i % 3) * 8}%`)} />
              <span style={{ ...bar(`${35 + (i % 2) * 10}%`), background: GOLD, opacity: .4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 2 — App Móvil (Phone)
   ═══════════════════════════════════════════ */
function MockupAppMovil() {
  const bar = (w: string): React.CSSProperties => ({
    height: 3, borderRadius: 2, background: '#2A2A2A', width: w,
  })

  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
      {/* Phone 1 */}
      <div style={{
        width: 140, background: '#141414', borderRadius: 18, border: '1px solid #222',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,.45)',
      }}>
        {/* Notch */}
        <div style={{
          width: 46, height: 5, background: BG, borderRadius: 3,
          margin: '8px auto 6px', flexShrink: 0,
        }} />
        {/* Status bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', padding: '0 14px', marginBottom: 4,
        }}>
          <span style={{ fontSize: 8, color: '#444' }}>9:41</span>
          <span style={{ fontSize: 8, color: '#444' }}>●●●</span>
        </div>
        {/* Screen content */}
        <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ ...bar(30), height: 4 }} />
            <span style={{ ...bar(22), height: 4 }} />
          </div>
          {/* Hero banner */}
          <div style={{
            height: 48, borderRadius: 6, background: 'linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.04))',
            border: '1px solid rgba(201,168,76,.1)',
          }} />
          {/* Cards */}
          {[1, 2].map((i) => (
            <div key={i} style={{
              background: '#1A1A1A', borderRadius: 6, padding: 8,
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4, flexShrink: 0,
                background: `#222`,
              }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={bar(`${50 + i * 8}%`)} />
                <span style={{ ...bar(`${30 + i * 5}%`), height: 2 }} />
              </div>
            </div>
          ))}
        </div>
        {/* Bottom nav */}
        <div style={{
          height: 28, background: '#161616', display: 'flex', justifyContent: 'space-around',
          alignItems: 'center', padding: '0 10px',
        }}>
          {['home', 'search', 'cart', 'user'].map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: 3,
              background: i === 0 ? GOLD : '#2A2A2A', opacity: i === 0 ? 1 : .5,
            }} />
          ))}
        </div>
      </div>

      {/* Phone 2 (slightly behind) */}
      <div style={{
        width: 130, background: '#111', borderRadius: 18, border: '1px solid #1a1a1a',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: .6,
        transform: 'translateY(12px)',
      }}>
        <div style={{
          width: 42, height: 5, background: BG, borderRadius: 3,
          margin: '8px auto 6px', flexShrink: 0,
        }} />
        <div style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 30, borderRadius: 6, background: '#1A1A1A' }} />
          <div style={{ height: 60, borderRadius: 6, background: '#1A1A1A' }} />
          <div style={{ height: 30, borderRadius: 6, background: '#1A1A1A' }} />
          <div style={{ height: 40, borderRadius: 6, background: '#1A1A1A' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 3 — Dashboard Admin (Laptop with charts)
   ═══════════════════════════════════════════ */
function MockupDashboard() {
  const bar = (w: string): React.CSSProperties => ({
    height: 4, borderRadius: 2, background: '#2A2A2A', width: w,
  })

  return (
    <div style={{
      width: '100%', maxWidth: 440, background: '#141414', borderRadius: 10,
      border: '1px solid #222', overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,.45)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Chrome */}
      <div style={{
        height: 28, background: '#1A1A1A', borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFBD2E', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28CA41', flexShrink: 0 }} />
        <div style={{ flex: 1, height: 13, background: '#111', borderRadius: 4, marginLeft: 8, maxWidth: 200 }} />
      </div>

      {/* Sidebar + Content layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 180 }}>
        {/* Sidebar */}
        <div style={{
          width: 50, background: '#111', borderRight: '1px solid #1e1e1e',
          padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 10,
          alignItems: 'center',
        }}>
          {[
            { w: 18, active: true },
            { w: 18, active: false },
            { w: 18, active: false },
            { w: 18, active: false },
            { w: 18, active: false },
          ].map((item, i) => (
            <div key={i} style={{
              width: item.w, height: 18, borderRadius: 4,
              background: item.active ? 'rgba(201,168,76,.2)' : '#1e1e1e',
              border: item.active ? '1px solid rgba(201,168,76,.25)' : '1px solid transparent',
            }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* KPI row */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Ventas', val: '$12.4k', color: GOLD },
              { label: 'Pedidos', val: '284', color: '#60a5fa' },
              { label: 'Clientes', val: '1.2k', color: '#4ade80' },
            ].map((kpi) => (
              <div key={kpi.label} style={{
                flex: 1, background: '#1A1A1A', borderRadius: 6, padding: '8px 10px',
                border: `1px solid ${kpi.color}15`,
              }}>
                <div style={{ fontSize: 7, color: '#555', marginBottom: 3, letterSpacing: '.05em', textTransform: 'uppercase' }}>{kpi.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: kpi.color }}>{kpi.val}</div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div style={{
            flex: 1, background: '#1A1A1A', borderRadius: 6, padding: 12,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ ...bar(40), height: 5, background: GOLD, opacity: .5 }} />
              <span style={bar(30)} />
            </div>
            {/* Bar chart */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 6, paddingBottom: 4 }}>
              {[40, 65, 45, 80, 55, 90, 70, 85, 50, 75, 60, 95].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: '2px 2px 0 0',
                  background: i === 11 ? GOLD : '#252525',
                  opacity: i === 11 ? 1 : .7,
                  minHeight: 4,
                }} />
              ))}
            </div>
            {/* X-axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'].map((m) => (
                <span key={m} style={{ fontSize: 7, color: '#444', width: 16, textAlign: 'center' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 4 — Delivery (Phone with map + tracking)
   ═══════════════════════════════════════════ */
function MockupDelivery() {
  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', alignItems: 'flex-end' }}>
      {/* Main phone — Tracking */}
      <div style={{
        width: 150, background: '#141414', borderRadius: 18, border: '1px solid #222',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 30px 60px rgba(0,0,0,.45)',
      }}>
        <div style={{
          width: 48, height: 5, background: BG, borderRadius: 3,
          margin: '8px auto 6px', flexShrink: 0,
        }} />

        {/* Map area */}
        <div style={{
          margin: '0 10px', height: 100, borderRadius: 8, position: 'relative',
          background: '#1A1A1A', overflow: 'hidden',
        }}>
          {/* Grid lines (simulating map) */}
          <div style={{ position: 'absolute', inset: 0, opacity: .3 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`h${i}`} style={{
                position: 'absolute', left: 0, right: 0, top: `${20 * i}%`,
                height: 1, background: '#2A2A2A',
              }} />
            ))}
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`v${i}`} style={{
                position: 'absolute', top: 0, bottom: 0, left: `${25 * i}%`,
                width: 1, background: '#2A2A2A',
              }} />
            ))}
          </div>
          {/* Route line */}
          <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%" viewBox="0 0 130 100" fill="none">
            <path d="M20 80 Q40 40 65 55 Q90 70 110 25" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 3" fill="none" opacity=".7" />
            <circle cx="20" cy="80" r="5" fill="#4ade80" opacity=".8" />
            <circle cx="110" cy="25" r="5" fill="#60a5fa" opacity=".8" />
            <circle cx="110" cy="25" r="8" fill="none" stroke="#60a5fa" strokeWidth="1" opacity=".4" />
          </svg>
        </div>

        {/* Tracking info */}
        <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            background: '#1A1A1A', borderRadius: 6, padding: 8,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 7, color: '#555', marginBottom: 2, letterSpacing: '.05em' }}>ESTADO</div>
              <div style={{ fontSize: 10, color: '#4ade80', fontWeight: 500 }}>En camino</div>
            </div>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { label: 'Pedido confirmado', done: true },
              { label: 'En preparación', done: true },
              { label: 'En camino', done: true, active: true },
              { label: 'Entregado', done: false },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: step.done ? (step.active ? '#60a5fa' : '#4ade80') : '#2A2A2A',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 8,
                  color: step.done ? (step.active ? '#60a5fa' : FG40) : '#333',
                }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Small phone — ETA */}
      <div style={{
        width: 120, background: '#111', borderRadius: 16, border: '1px solid #1a1a1a',
        overflow: 'hidden', padding: '12px 10px', opacity: .6,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{
          width: 36, height: 4, background: BG, borderRadius: 2,
          margin: '0 auto', flexShrink: 0,
        }} />
        <div style={{
          height: 50, borderRadius: 6, background: '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 600, color: '#60a5fa',
        }}>
          23 min
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ height: 3, borderRadius: 2, background: '#2A2A2A', width: '80%' }} />
          <div style={{ height: 3, borderRadius: 2, background: '#2A2A2A', width: '55%' }} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 5 — Marketing Digital (Browser)
   ═══════════════════════════════════════════ */
function MockupMarketing() {
  const bar = (w: string): React.CSSProperties => ({
    height: 4, borderRadius: 2, background: '#2A2A2A', width: w,
  })

  return (
    <div style={{
      width: '100%', maxWidth: 420, background: '#141414', borderRadius: 10,
      border: '1px solid #222', overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,.45)',
    }}>
      {/* Chrome */}
      <div style={{
        height: 28, background: '#1A1A1A', borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFBD2E', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28CA41', flexShrink: 0 }} />
        <div style={{ flex: 1, height: 13, background: '#111', borderRadius: 4, marginLeft: 8, maxWidth: 200 }} />
      </div>

      <div style={{ padding: 14, display: 'flex', gap: 12 }}>
        {/* Social post preview */}
        <div style={{
          flex: 1, background: '#1A1A1A', borderRadius: 6, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Post header */}
          <div style={{
            padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,168,76,.3), rgba(201,168,76,.1))',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ ...bar(60), height: 4, background: '#333' }} />
              <span style={{ ...bar(30), height: 3, background: '#222' }} />
            </div>
          </div>
          {/* Post image placeholder */}
          <div style={{
            height: 80, background: 'linear-gradient(135deg, #1e1e1e, #222)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          {/* Post actions */}
          <div style={{
            padding: '8px 10px', display: 'flex', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#C9A84C" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </div>
        </div>

        {/* Analytics sidebar */}
        <div style={{
          width: 110, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* Mini stat cards */}
          {[
            { label: 'Alcance', val: '24.5k', color: GOLD },
            { label: 'Engagement', val: '8.3%', color: '#4ade80' },
            { label: 'Clics', val: '1.2k', color: '#60a5fa' },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#1A1A1A', borderRadius: 6, padding: '8px 10px',
              borderLeft: `2px solid ${s.color}40`,
            }}>
              <div style={{ fontSize: 7, color: '#555', marginBottom: 3, letterSpacing: '.04em', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.val}</div>
            </div>
          ))}

          {/* Mini bar chart */}
          <div style={{
            background: '#1A1A1A', borderRadius: 6, padding: '8px 10px', flex: 1,
          }}>
            <div style={{ fontSize: 7, color: '#555', marginBottom: 6 }}>ÚLTIMOS 7 DÍAS</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
              {[30, 50, 35, 70, 45, 85, 60].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`, borderRadius: 1,
                  background: i === 5 ? GOLD : '#252525',
                  minHeight: 3,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 6 — Métricas y Reportes (Dashboard with KPIs + line chart)
   ═══════════════════════════════════════════ */
function MockupMetricas() {
  return (
    <div style={{
      width: '100%', maxWidth: 440, background: '#141414', borderRadius: 10,
      border: '1px solid #222', overflow: 'hidden',
      boxShadow: '0 30px 60px rgba(0,0,0,.45)',
    }}>
      {/* Chrome */}
      <div style={{
        height: 28, background: '#1A1A1A', borderRadius: '10px 10px 0 0',
        display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5F57', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFBD2E', flexShrink: 0 }} />
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#28CA41', flexShrink: 0 }} />
        <div style={{ flex: 1, height: 13, background: '#111', borderRadius: 4, marginLeft: 8, maxWidth: 200 }} />
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            { label: 'Ingresos', val: '$48.2k', change: '+12.5%', up: true, color: GOLD },
            { label: 'Clientes', val: '3,847', change: '+8.2%', up: true, color: '#4ade80' },
            { label: 'Ticket Prom.', val: '$125', change: '-2.1%', up: false, color: '#60a5fa' },
            { label: 'Tasa Conv.', val: '3.4%', change: '+0.8%', up: true, color: '#c084fc' },
          ].map((kpi) => (
            <div key={kpi.label} style={{
              background: '#1A1A1A', borderRadius: 6, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 8, color: '#555', marginBottom: 4, letterSpacing: '.04em', textTransform: 'uppercase' }}>{kpi.label}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: kpi.color, marginBottom: 3 }}>{kpi.val}</div>
              <div style={{
                fontSize: 8, color: kpi.up ? '#4ade80' : '#f87171',
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{
                  transform: kpi.up ? 'none' : 'rotate(180deg)',
                }}>
                  <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                </svg>
                {kpi.change}
              </div>
            </div>
          ))}
        </div>

        {/* Line chart */}
        <div style={{
          background: '#1A1A1A', borderRadius: 6, padding: '12px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 8, color: '#555', letterSpacing: '.04em', textTransform: 'uppercase' }}>Tendencia de Ventas</span>
            <span style={{ fontSize: 8, color: GOLD, opacity: .6 }}>Últimos 30 días</span>
          </div>
          <svg width="100%" height="60" viewBox="0 0 360 60" preserveAspectRatio="none" fill="none">
            {/* Grid */}
            <line x1="0" y1="15" x2="360" y2="15" stroke="#1e1e1e" strokeWidth="1" />
            <line x1="0" y1="30" x2="360" y2="30" stroke="#1e1e1e" strokeWidth="1" />
            <line x1="0" y1="45" x2="360" y2="45" stroke="#1e1e1e" strokeWidth="1" />
            {/* Area fill */}
            <path
              d="M0 50 Q30 42 60 38 T120 30 T180 22 T240 28 T300 15 T360 10 V60 H0 Z"
              fill="url(#areaGrad)" opacity=".3"
            />
            {/* Line */}
            <path
              d="M0 50 Q30 42 60 38 T120 30 T180 22 T240 28 T300 15 T360 10"
              stroke={GOLD} strokeWidth="2" fill="none"
            />
            {/* Dots */}
            <circle cx="60" cy="38" r="3" fill={GOLD} opacity=".6" />
            <circle cx="180" cy="22" r="3" fill={GOLD} opacity=".6" />
            <circle cx="300" cy="15" r="3" fill={GOLD} />
            <circle cx="360" cy="10" r="3" fill={GOLD} />
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
                <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((w) => (
              <span key={w} style={{ fontSize: 7, color: '#444' }}>{w}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mockup dispatcher ─── */
const mockupComponents = [
  <MockupTiendaOnline key="tienda" />,
  <MockupAppMovil key="app" />,
  <MockupDashboard key="dashboard" />,
  <MockupDelivery key="delivery" />,
  <MockupMarketing key="marketing" />,
  <MockupMetricas key="metricas" />,
]

/* ═══════════════════════════════════════════
   Badge Component
   ═══════════════════════════════════════════ */
function Badge({ type }: { type: 'POPULAR' | 'NUEVO' }) {
  const isPopular = type === 'POPULAR'
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 3,
      fontSize: '9px',
      fontWeight: 600,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      background: isPopular ? 'rgba(201,168,76,.1)' : 'rgba(96,165,250,.1)',
      color: isPopular ? GOLD : '#60a5fa',
      border: isPopular ? '1px solid rgba(201,168,76,.15)' : '1px solid rgba(96,165,250,.15)',
    }}>
      {type}
    </span>
  )
}

/* ═══════════════════════════════════════════
   Service Row
   ═══════════════════════════════════════════ */
function ServiceRow({
  index,
  title,
  desc,
  badge,
  mockup,
}: {
  index: number
  title: string
  desc: string
  badge: 'POPULAR' | 'NUEVO' | null
  mockup: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const isEven = index % 2 === 1

  return (
    <div
      ref={ref}
      className={`v2svc-row${isEven ? ' even' : ''}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity .7s cubic-bezier(.22,1,.36,1) ${index * 0.08}s, transform .7s cubic-bezier(.22,1,.36,1) ${index * 0.08}s`,
      }}
    >
      {/* Text side */}
      <div className="v2svc-text">
        {badge && <Badge type={badge} />}
        <h3 style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '1.3rem',
          fontWeight: 500,
          color: FG,
          marginTop: badge ? 12 : 0,
          lineHeight: 1.3,
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '13px',
          color: FG40,
          lineHeight: 1.7,
          marginTop: 8,
          maxWidth: 400,
        }}>
          {desc}
        </p>
        <span style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: '12px',
          color: GOLD,
          marginTop: 16,
          display: 'inline-block',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'text-decoration .2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
        onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
        >
          Ver cómo funciona →
        </span>
      </div>

      {/* Mockup side */}
      <div className="v2svc-mockup" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {mockup}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   V2Services — Main Export
   ═══════════════════════════════════════════ */
export default function V2Services() {
  return (
    <section
      id="servicios"
      style={{
        background: BG,
        padding: '80px 24px',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
      }}>
        {/* ── Section Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '.15em',
            textTransform: 'uppercase',
            color: GOLD,
            display: 'block',
          }}>
            NUESTROS SERVICIOS
          </span>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2rem',
            fontWeight: 300,
            color: FG,
            marginTop: 12,
            lineHeight: 1.3,
          }}>
            Todo lo que necesitas para vender más
          </h2>
        </div>

        {/* ── Service Items ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 60,
        }}>
          {services.map((svc, i) => (
            <ServiceRow
              key={svc.title}
              index={i}
              title={svc.title}
              desc={svc.desc}
              badge={svc.badge}
              mockup={mockupComponents[i]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
