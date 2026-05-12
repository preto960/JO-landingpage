'use client'

import { useState, useEffect, useCallback } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavLink {
  label: string
  href: string       // e.g. "#servicios"
}

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const NAV_LINKS: NavLink[] = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Precios', href: '#precios' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'FAQ', href: '#faq' },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Smooth-scroll to a section by its id (strip leading "#"). */
function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/** Generic click handler that extracts the id from the href and scrolls. */
function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const id = href.replace('#', '')
  if (id) {
    e.preventDefault()
    scrollToSection(id)
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function V2Nav({ primary = '#C9A84C', logoUrl }: { primary?: string; logoUrl?: string | null } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [drawerReady, setDrawerReady] = useState(false) // controls CSS class mount

  /* ---- scroll listener ---- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial check
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- lock body scroll when drawer open ---- */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      // Double-rAF so the CSS transition fires
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDrawerReady(true))
      })
    } else {
      setDrawerReady(false)
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  /* ---- close drawer on Escape ---- */
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  /* ---- nav click handler (also closes drawer on mobile) ---- */
  const onLinkClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      handleNavClick(e, href)
      setMobileOpen(false)
    },
    [],
  )

  /* ---- CTA click placeholder ---- */
  const onCtaClick = useCallback((_e: React.MouseEvent) => {
    setMobileOpen(false)
    // TODO: wire up real demo / contact action
  }, [])

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <>
      {/* ---------- injected <style> for media queries & animations ---------- */}
      <style>{`
        /* --- hamburger animation --- */
        @keyframes v2-ham-top-in  { from { transform: rotate(0deg) translateY(0); } to { transform: rotate(45deg) translateY(6px); } }
        @keyframes v2-ham-mid-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes v2-ham-bot-in  { from { transform: rotate(0deg) translateY(0); } to { transform: rotate(-45deg) translateY(-6px); } }

        .v2-ham-bar {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #F5F0E8;
          border-radius: 2px;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        /* open state transforms */
        .v2-hamburger--open .v2-ham-bar:nth-child(1) {
          transform: rotate(45deg) translateY(6px);
        }
        .v2-hamburger--open .v2-ham-bar:nth-child(2) {
          opacity: 0;
        }
        .v2-hamburger--open .v2-ham-bar:nth-child(3) {
          transform: rotate(-45deg) translateY(-6px);
        }

        /* --- drawer overlay --- */
        .v2-drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .v2-drawer-overlay--visible {
          opacity: 1;
          pointer-events: auto;
        }

        /* --- drawer panel --- */
        .v2-drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 100%;
          max-width: 340px;
          background: #0A0A0A;
          border-left: 1px solid rgba(245, 240, 232, 0.06);
          z-index: 1001;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          display: flex;
          flex-direction: column;
        }
        .v2-drawer--open {
          transform: translateX(0);
        }

        /* --- desktop nav links hover underline effect --- */
        .v2-nav-link {
          position: relative;
        }
        .v2-nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 1px;
          background: #C9A84C;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .v2-nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* --- hide desktop nav on mobile, hide hamburger on desktop --- */
        @media (max-width: 768px) {
          .v2-desktop-links { display: none !important; }
          .v2-desktop-ctas  { display: none !important; }
          .v2-hamburger     { display: flex !important; }
        }
        @media (min-width: 769px) {
          .v2-hamburger { display: none !important; }
          .v2-drawer    { display: none !important; }
          .v2-drawer-overlay { display: none !important; }
        }
      `}</style>

      {/* ======================= NAV BAR ======================= */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 'clamp(20px, 4vw, 48px)',
          paddingRight: 'clamp(20px, 4vw, 48px)',
          background: scrolled
            ? 'rgba(10, 10, 10, 0.92)'
            : 'rgba(10, 10, 10, 0.8)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: '1px solid rgba(245, 240, 232, 0.06)',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, -webkit-backdrop-filter 0.4s ease',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* ---- LOGO ---- */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setMobileOpen(false)
          }}
          aria-label="JO — scroll to top"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            fontWeight: 600,
            color: primary,
            letterSpacing: '.06em',
            textDecoration: 'none',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" style={{ height: 28 }} />
          ) : (
            'JO'
          )}
        </a>

        {/* ---- CENTER LINKS (desktop) ---- */}
        <div
          className="v2-desktop-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '36px',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => onLinkClick(e, link.href)}
              className="v2-nav-link"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '11px',
                fontWeight: 400,
                letterSpacing: '.08em',
                textTransform: 'uppercase' as const,
                color: 'rgba(245, 240, 232, 0.55)',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                ;(e.target as HTMLElement).style.color = '#F5F0E8'
              }}
              onMouseLeave={(e) => {
                ;(e.target as HTMLElement).style.color = 'rgba(245, 240, 232, 0.55)'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* ---- RIGHT CTAs (desktop) ---- */}
        <div
          className="v2-desktop-ctas"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Ver Demo — outline */}
          <button
            onClick={onCtaClick}
            type="button"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '.08em',
              textTransform: 'uppercase' as const,
              color: 'rgba(245, 240, 232, 0.5)',
              background: 'transparent',
              border: '1px solid rgba(245, 240, 232, 0.15)',
              borderRadius: '4px',
              padding: '8px 20px',
              cursor: 'pointer',
              transition: 'color 0.3s ease, border-color 0.3s ease, background 0.3s ease',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.color = '#F5F0E8'
              t.style.borderColor = 'rgba(245, 240, 232, 0.35)'
              t.style.background = 'rgba(245, 240, 232, 0.04)'
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.color = 'rgba(245, 240, 232, 0.5)'
              t.style.borderColor = 'rgba(245, 240, 232, 0.15)'
              t.style.background = 'transparent'
            }}
          >
            Ver Demo
          </button>

          {/* Cotiza gratis — solid gold */}
          <button
            onClick={onCtaClick}
            type="button"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase' as const,
              color: '#0A0A0A',
              background: primary,
              border: 'none',
              borderRadius: '4px',
              padding: '8px 22px',
              cursor: 'pointer',
              transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.background = '#D4B45C'
              t.style.transform = 'translateY(-1px)'
              t.style.boxShadow = '0 4px 20px rgba(201, 168, 76, 0.3)'
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.background = '#C9A84C'
              t.style.transform = 'translateY(0)'
              t.style.boxShadow = 'none'
            }}
          >
            Cotiza gratis
          </button>
        </div>

        {/* ---- HAMBURGER (mobile) ---- */}
        <button
          className={`v2-hamburger ${mobileOpen ? 'v2-hamburger--open' : ''}`}
          type="button"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '5px',
            width: '40px',
            height: '40px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            position: 'relative',
            zIndex: 1002,
          }}
        >
          <span className="v2-ham-bar" />
          <span className="v2-ham-bar" />
          <span className="v2-ham-bar" />
        </button>
      </nav>

      {/* ======================= DRAWER OVERLAY ======================= */}
      <div
        className={`v2-drawer-overlay ${drawerReady ? 'v2-drawer-overlay--visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ======================= MOBILE DRAWER ======================= */}
      <aside
        className={`v2-drawer ${drawerReady ? 'v2-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* drawer header with close area */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '24px',
            borderBottom: '1px solid rgba(245, 240, 232, 0.06)',
            flexShrink: 0,
          }}
        >
          {/* close X button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            type="button"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(245, 240, 232, 0.06)',
              border: '1px solid rgba(245, 240, 232, 0.1)',
              borderRadius: '50%',
              cursor: 'pointer',
              color: '#F5F0E8',
              fontSize: '18px',
              lineHeight: 1,
              transition: 'background 0.2s ease',
            }}
          >
            ✕
          </button>
        </div>

        {/* drawer links */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '32px',
            gap: '8px',
            overflowY: 'auto',
          }}
        >
          {NAV_LINKS.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => onLinkClick(e, link.href)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '.1em',
                textTransform: 'uppercase' as const,
                color: 'rgba(245, 240, 232, 0.45)',
                textDecoration: 'none',
                padding: '14px 28px',
                borderLeft: '2px solid transparent',
                transition: 'color 0.25s ease, border-color 0.25s ease, background 0.25s ease',
                /* stagger animation delay for entrance effect */
                opacity: drawerReady ? 1 : 0,
                transform: drawerReady ? 'translateX(0)' : 'translateX(12px)',
                transitionProperty: 'opacity, transform, color, border-color, background',
                transitionDuration: '0.3s, 0.35s, 0.25s, 0.25s, 0.25s',
                transitionDelay: drawerReady ? `${idx * 0.05 + 0.1}s` : '0s',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget
                t.style.color = '#F5F0E8'
                t.style.borderLeftColor = '#C9A84C'
                t.style.background = 'rgba(245, 240, 232, 0.03)'
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget
                t.style.color = 'rgba(245, 240, 232, 0.45)'
                t.style.borderLeftColor = 'transparent'
                t.style.background = 'transparent'
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* drawer footer — CTAs */}
        <div
          style={{
            padding: '28px',
            borderTop: '1px solid rgba(245, 240, 232, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          {/* Ver Demo — outline */}
          <button
            onClick={onCtaClick}
            type="button"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '.08em',
              textTransform: 'uppercase' as const,
              color: 'rgba(245, 240, 232, 0.5)',
              background: 'transparent',
              border: '1px solid rgba(245, 240, 232, 0.15)',
              borderRadius: '4px',
              padding: '12px 20px',
              cursor: 'pointer',
              transition: 'color 0.3s ease, border-color 0.3s ease, background 0.3s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.color = '#F5F0E8'
              t.style.borderColor = 'rgba(245, 240, 232, 0.35)'
              t.style.background = 'rgba(245, 240, 232, 0.04)'
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.color = 'rgba(245, 240, 232, 0.5)'
              t.style.borderColor = 'rgba(245, 240, 232, 0.15)'
              t.style.background = 'transparent'
            }}
          >
            Ver Demo
          </button>

          {/* Cotiza gratis — solid gold */}
          <button
            onClick={onCtaClick}
            type="button"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase' as const,
              color: '#0A0A0A',
              background: '#C9A84C',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 20px',
              cursor: 'pointer',
              transition: 'background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget
              t.style.background = '#D4B45C'
              t.style.transform = 'translateY(-1px)'
              t.style.boxShadow = '0 4px 20px rgba(201, 168, 76, 0.3)'
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget
              t.style.background = '#C9A84C'
              t.style.transform = 'translateY(0)'
              t.style.boxShadow = 'none'
            }}
          >
            Cotiza gratis
          </button>
        </div>
      </aside>
    </>
  )
}
