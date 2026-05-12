'use client'

import { useEffect, useRef, useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   V2Platforms — Platforms Section
   ═══════════════════════════════════════════════════════════ */

const GOLD = '#C9A84C'
const BG = '#0A0A0A'
const FG = '#F5F0E8'
const FG40 = 'rgba(245,240,232,.4)'
const FG35 = 'rgba(245,240,232,.35)'
const FG25 = 'rgba(245,240,232,.25)'
const FG20 = 'rgba(245,240,232,.2)'

/* ─── Responsive <style> tag ─── */
const responsiveCSS = `
  .v2plat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 48px;
  }

  @media (max-width: 768px) {
    .v2plat-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      max-width: 420px;
      margin-left: auto;
      margin-right: auto;
      margin-top: 36px;
    }
  }

  .v2plat-card {
    background: rgba(245,240,232,0.02);
    border: 1px solid rgba(245,240,232,0.06);
    border-radius: 8px;
    padding: 20px;
    cursor: default;
    transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s ease;
  }

  .v2plat-card:hover {
    border-color: rgba(201,168,76,0.25);
    box-shadow: 0 0 30px rgba(201,168,76,0.06), 0 0 60px rgba(201,168,76,0.03);
    transform: translateY(-2px);
  }

  .v2plat-logos {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0;
  }

  .v2plat-logo-item {
    font-family: 'Jost', sans-serif;
    font-size: 13px;
    color: ${FG20};
    transition: color 0.3s ease;
    cursor: default;
    white-space: nowrap;
    padding: 4px 0;
  }

  .v2plat-logo-item:hover {
    color: ${FG40};
  }

  .v2plat-logo-dot {
    color: ${FG20};
    margin: 0 14px;
    user-select: none;
  }

  @media (max-width: 768px) {
    .v2plat-logo-dot {
      margin: 0 10px;
    }
    .v2plat-logo-item {
      font-size: 12px;
    }
  }
`

/* ═══════════════════════════════════════════
   MOCKUP 1 — Tienda Web (Browser Window)
   ═══════════════════════════════════════════ */
function MockupTiendaWeb() {
  const dot = (c: string): React.CSSProperties => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: c,
    flexShrink: 0,
  })

  const placeholderGradient = (i: number) => {
    const gradients = [
      'linear-gradient(135deg, #C9A84C, #8B6914)',
      'linear-gradient(135deg, #E8D5B7, #A0845C)',
      'linear-gradient(135deg, #7C9EB2, #4A6B7F)',
      'linear-gradient(135deg, #B8860B, #6B4E0A)',
    ]
    return gradients[i % gradients.length]
  }

  return (
    <div
      style={{
        width: '100%',
        background: '#141414',
        borderRadius: 8,
        border: '1px solid #222',
        overflow: 'hidden',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 26,
          background: '#1A1A1A',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 5,
          borderBottom: '1px solid #222',
        }}
      >
        <span style={dot('#FF5F57')} />
        <span style={dot('#FFBD2E')} />
        <span style={dot('#28CA41')} />
        <div
          style={{
            flex: 1,
            height: 12,
            background: '#111',
            borderRadius: 4,
            marginLeft: 8,
            maxWidth: 180,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
          }}
        >
          <svg
            width="7"
            height="7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2.5"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span
            style={{
              marginLeft: 6,
              fontSize: 7,
              color: '#444',
              fontFamily: "'Jost', sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            mitienda.com
          </span>
        </div>
      </div>

      {/* Fake navbar */}
      <div
        style={{
          height: 30,
          background: '#161616',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          borderBottom: '1px solid #1e1e1e',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 20,
            height: 6,
            borderRadius: 2,
            background: GOLD,
            opacity: 0.7,
          }}
        />
        {/* Nav items */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          {['Inicio', 'Productos', 'Ofertas', 'Contacto'].map(
            (item, i) => (
              <span
                key={item}
                style={{
                  fontSize: 7,
                  color: i === 0 ? FG : '#555',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: i === 0 ? 600 : 400,
                }}
              >
                {item}
              </span>
            ),
          )}
        </div>
        {/* Search */}
        <div
          style={{
            width: 50,
            height: 10,
            borderRadius: 4,
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 4,
          }}
        >
          <svg
            width="6"
            height="6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#555"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        {/* Cart icon */}
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 3,
            background: 'rgba(201,168,76,.1)',
            border: '1px solid rgba(201,168,76,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke={GOLD}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
        </div>
      </div>

      {/* Product Grid 2x2 */}
      <div
        style={{
          padding: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        {[
          { name: 'Camiseta Premium', price: '$29.99' },
          { name: 'Zapatillas Sport', price: '$89.90' },
          { name: 'Bolso de Cuero', price: '$54.50' },
          { name: 'Reloj Clásico', price: '$120.00' },
        ].map((product, i) => (
          <div
            key={i}
            style={{
              background: '#1A1A1A',
              borderRadius: 6,
              overflow: 'hidden',
              border: '1px solid #222',
            }}
          >
            {/* Product image placeholder */}
            <div
              style={{
                width: '100%',
                aspectRatio: '4/3',
                background: placeholderGradient(i),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Subtle overlay pattern */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 30% 40%, rgba(255,255,255,.08) 0%, transparent 50%)',
                }}
              />
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,.2)"
                strokeWidth="1"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            {/* Product info */}
            <div style={{ padding: '8px' }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: '#2a2a2a',
                  width: '70%',
                  marginBottom: 5,
                }}
              />
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: GOLD,
                  opacity: 0.5,
                  width: '45%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 2 — App Móvil (Phone Frame)
   ═══════════════════════════════════════════ */
function MockupAppMovil() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 160,
          background: '#141414',
          borderRadius: 20,
          border: '2px solid #2a2a2a',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Notch / Dynamic Island */}
        <div
          style={{
            width: 50,
            height: 6,
            background: BG,
            borderRadius: 3,
            margin: '8px auto 4px',
            flexShrink: 0,
            border: '1px solid #222',
          }}
        />

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 16px',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontSize: 8,
              color: '#555',
              fontFamily: "'Jost', sans-serif",
              fontWeight: 500,
            }}
          >
            9:41
          </span>
          <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {/* Signal */}
            <div
              style={{
                display: 'flex',
                gap: 1,
                alignItems: 'flex-end',
                height: 8,
              }}
            >
              {[3, 5, 7, 8].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 2,
                    height: h,
                    borderRadius: 1,
                    background: i >= 2 ? '#555' : '#333',
                  }}
                />
              ))}
            </div>
            {/* Battery */}
            <div
              style={{
                width: 14,
                height: 7,
                borderRadius: 1,
                border: '1px solid #555',
                display: 'flex',
                padding: 1,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: '100%',
                  borderRadius: 0.5,
                  background: '#555',
                }}
              />
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div
          style={{
            flex: 1,
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: FG,
                fontFamily: "'Jost', sans-serif",
                fontWeight: 600,
              }}
            >
              Explorar
            </span>
            <div
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {/* Search */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#555"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {/* Bell */}
              <div style={{ position: 'relative' }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#555"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <div
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#ef4444',
                    position: 'absolute',
                    top: -1,
                    right: -1,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Todo', 'Moda', 'Tech'].map((cat, i) => (
              <span
                key={cat}
                style={{
                  fontSize: 7,
                  padding: '3px 8px',
                  borderRadius: 10,
                  background: i === 0 ? 'rgba(201,168,76,.15)' : '#1e1e1e',
                  color: i === 0 ? GOLD : '#555',
                  border: i === 0
                    ? '1px solid rgba(201,168,76,.2)'
                    : '1px solid #2a2a2a',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                }}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Product Cards */}
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                background: '#1A1A1A',
                borderRadius: 10,
                padding: 8,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                border: '1px solid #222',
              }}
            >
              {/* Product thumbnail */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  flexShrink: 0,
                  background:
                    i === 0
                      ? 'linear-gradient(135deg, #C9A84C, #7A5C1A)'
                      : 'linear-gradient(135deg, #6B8A99, #3D5566)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 8,
                    background:
                      'radial-gradient(circle at 40% 30%, rgba(255,255,255,.12) 0%, transparent 60%)',
                  }}
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,.25)"
                  strokeWidth="1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              {/* Product info */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: '#333',
                    width: i === 0 ? '80%' : '65%',
                  }}
                />
                <div
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: '#2a2a2a',
                    width: '55%',
                  }}
                />
                <div
                  style={{
                    height: 3,
                    borderRadius: 2,
                    background: GOLD,
                    opacity: 0.4,
                    width: '35%',
                    marginTop: 1,
                  }}
                />
              </div>
              {/* Add to cart */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(201,168,76,.1)',
                  border: '1px solid rgba(201,168,76,.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={GOLD}
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom navigation */}
        <div
          style={{
            height: 34,
            background: '#161616',
            borderTop: '1px solid #222',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            padding: '0 12px',
          }}
        >
          {[
            {
              label: 'Home',
              active: true,
              path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
            },
            {
              label: 'Search',
              active: false,
              path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
            },
            {
              label: 'Cart',
              active: false,
              path: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z',
            },
            {
              label: 'Profile',
              active: false,
              path: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z',
            },
          ].map((nav) => (
            <div
              key={nav.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={nav.active ? GOLD : '#444'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {nav.label === 'Home' && (
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                )}
                {nav.label === 'Search' && (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </>
                )}
                {nav.label === 'Cart' && (
                  <>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </>
                )}
                {nav.label === 'Profile' && (
                  <>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </>
                )}
              </svg>
              <span
                style={{
                  fontSize: 6,
                  color: nav.active ? GOLD : '#444',
                  fontFamily: "'Jost', sans-serif",
                }}
              >
                {nav.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MOCKUP 3 — Dashboard Admin (Laptop frame)
   ═══════════════════════════════════════════ */
function MockupDashboard() {
  return (
    <div
      style={{
        width: '100%',
        background: '#141414',
        borderRadius: 8,
        border: '1px solid #222',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          height: 26,
          background: '#1A1A1A',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: 5,
          borderBottom: '1px solid #222',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#FF5F57',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#FFBD2E',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#28CA41',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            height: 12,
            background: '#111',
            borderRadius: 4,
            marginLeft: 8,
            maxWidth: 160,
          }}
        />
      </div>

      {/* Sidebar + Content layout */}
      <div style={{ flex: 1, display: 'flex', minHeight: 190 }}>
        {/* Sidebar */}
        <div
          style={{
            width: 44,
            background: '#111',
            borderRight: '1px solid #1e1e1e',
            padding: '8px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center',
          }}
        >
          {/* Sidebar logo */}
          <div
            style={{
              width: 22,
              height: 6,
              borderRadius: 2,
              background: GOLD,
              opacity: 0.5,
              marginBottom: 4,
            }}
          />
          {/* Nav items */}
          {[
            { active: true, icon: 'grid' },
            { active: false, icon: 'list' },
            { active: false, icon: 'users' },
            { active: false, icon: 'chart' },
            { active: false, icon: 'settings' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 22,
                borderRadius: 4,
                background: item.active
                  ? 'rgba(201,168,76,.15)'
                  : 'transparent',
                border: item.active
                  ? '1px solid rgba(201,168,76,.2)'
                  : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.icon === 'grid' && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={
                    item.active ? GOLD : '#444'
                  }
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
              )}
              {item.icon === 'list' && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="1.5"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
              {item.icon === 'users' && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              )}
              {item.icon === 'chart' && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="1.5"
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              )}
              {item.icon === 'settings' && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="1.5"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* KPI cards row */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              {
                label: 'Ventas Hoy',
                val: '$4,280',
                color: GOLD,
                change: '+18%',
              },
              {
                label: 'Pedidos',
                val: '67',
                color: '#60a5fa',
                change: '+12%',
              },
              {
                label: 'Clientes',
                val: '1,847',
                color: '#4ade80',
                change: '+5%',
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  flex: 1,
                  background: '#1A1A1A',
                  borderRadius: 6,
                  padding: '8px 8px',
                  border: `1px solid ${kpi.color}12`,
                }}
              >
                <div
                  style={{
                    fontSize: 6,
                    color: '#555',
                    marginBottom: 3,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {kpi.label}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: kpi.color,
                    fontFamily: "'Jost', sans-serif",
                    lineHeight: 1.2,
                  }}
                >
                  {kpi.val}
                </div>
                <div
                  style={{
                    fontSize: 6,
                    color: '#4ade80',
                    marginTop: 2,
                    fontFamily: "'Jost', sans-serif",
                  }}
                >
                  {kpi.change}
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart area */}
          <div
            style={{
              flex: 1,
              background: '#1A1A1A',
              borderRadius: 6,
              padding: '10px 10px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              border: '1px solid #222',
            }}
          >
            {/* Chart header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 7,
                  color: '#666',
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 500,
                }}
              >
                Ingresos Semanales
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['7D', '30D', '90D'].map((tab, i) => (
                  <span
                    key={tab}
                    style={{
                      fontSize: 6,
                      padding: '2px 5px',
                      borderRadius: 3,
                      background: i === 1
                        ? 'rgba(201,168,76,.12)'
                        : 'transparent',
                      color: i === 1 ? GOLD : '#555',
                      fontFamily: "'Jost', sans-serif",
                    }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 4,
                paddingBottom: 2,
              }}
            >
              {[35, 58, 42, 72, 50, 85, 65].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: '2px 2px 0 0',
                    background:
                      i === 5
                        ? GOLD
                        : 'linear-gradient(to top, #252525, #2a2a2a)',
                    opacity: i === 5 ? 1 : 0.8,
                    minHeight: 4,
                    position: 'relative',
                  }}
                >
                  {/* Tooltip dot on highlighted bar */}
                  {i === 5 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -4,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 3,
                        height: 3,
                        borderRadius: '50%',
                        background: GOLD,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(
                (d) => (
                  <span
                    key={d}
                    style={{
                      fontSize: 6,
                      color: '#444',
                      fontFamily: "'Jost', sans-serif",
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    {d}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Platform data ─── */
const platforms = [
  {
    title: 'Tienda Web',
    description:
      'Catálogo completo, carrito de compras, pasarelas de pago y gestión de pedidos.',
    mockup: <MockupTiendaWeb />,
  },
  {
    title: 'App Móvil',
    description:
      'Disponible para iOS y Android. Notificaciones push y compra en 2 taps.',
    mockup: <MockupAppMovil />,
  },
  {
    title: 'Dashboard Admin',
    description:
      'Gestiona productos, pedidos, clientes y métricas desde cualquier lugar.',
    mockup: <MockupDashboard />,
  },
]

/* ─── Integration logos ─── */
const integrations = [
  'MercadoPago',
  'Wompi',
  'PayU',
  'Stripe',
  'WhatsApp Business',
  'Google Analytics',
]

/* ═══════════════════════════════════════════
   V2Platforms — Main Export
   ═══════════════════════════════════════════ */
export default function V2Platforms() {
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
      <style dangerouslySetInnerHTML={{ __html: responsiveCSS }} />

      <section
        id="plataformas"
        ref={sectionRef}
        style={{
          padding: '80px 24px',
          background: BG,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition:
            'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {/* ── Eyebrow ── */}
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '10px',
              color: GOLD,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: 0,
            }}
          >
            PLATAFORMAS
          </p>

          {/* ── Title ── */}
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              color: FG,
              fontWeight: 300,
              textAlign: 'center',
              margin: '12px 0 0 0',
              lineHeight: 1.3,
            }}
          >
            Tu negocio en todas las pantallas
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
              maxWidth: 480,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Una plataforma, tres experiencias. Todo sincronizado en tiempo real.
          </p>

          {/* ── Platform Cards Grid ── */}
          <div className="v2plat-grid">
            {platforms.map((platform, idx) => (
              <div
                key={platform.title}
                className="v2plat-card"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible
                    ? 'translateY(0)'
                    : 'translateY(20px)',
                  transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + idx * 0.12}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + idx * 0.12}s, border-color 0.4s ease, box-shadow 0.4s ease`,
                }}
              >
                {/* Mockup */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  {platform.mockup}
                </div>

                {/* Card Title */}
                <h3
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '16px',
                    color: FG,
                    fontWeight: 500,
                    textAlign: 'center',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {platform.title}
                </h3>

                {/* Card Description */}
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '12px',
                    color: FG35,
                    textAlign: 'center',
                    margin: '6px 0 0 0',
                    lineHeight: 1.6,
                  }}
                >
                  {platform.description}
                </p>
              </div>
            ))}
          </div>

          {/* ── Integration Logos ── */}
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '11px',
                color: FG25,
                margin: '0 0 16px 0',
                letterSpacing: '0.04em',
              }}
            >
              Integrado con:
            </p>
            <div className="v2plat-logos">
              {integrations.map((name, i) => (
                <span key={name} style={{ display: 'contents' }}>
                  <span
                    className="v2plat-logo-item"
                    style={{
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.5s ease ${0.5 + i * 0.06}s, color 0.3s ease`,
                    }}
                  >
                    {name}
                  </span>
                  {i < integrations.length - 1 && (
                    <span
                      className="v2plat-logo-dot"
                      style={{
                        opacity: visible ? 1 : 0,
                        transition: `opacity 0.5s ease ${0.5 + i * 0.06}s`,
                      }}
                    >
                      •
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
