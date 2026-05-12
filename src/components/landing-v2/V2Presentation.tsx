'use client'

import { ReactNode } from 'react'

/**
 * V2 Presentation — Modern template placeholder
 * Will be built out in Phases 2-6
 * Currently shows a coming-soon screen when selected
 */
export default function V2Presentation() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0A0A',
      color: '#F5F0E8',
      fontFamily: "'Jost', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        fontSize: '12px',
        letterSpacing: '.15em',
        textTransform: 'uppercase',
        color: '#60a5fa',
        border: '1px solid rgba(96,165,250,.2)',
        padding: '6px 16px',
        borderRadius: '3px',
        background: 'rgba(96,165,250,.05)',
      }}>
        JO Modern — Proximamente
      </div>
      <p style={{
        fontSize: '13px',
        color: 'rgba(245,240,232,.35)',
        letterSpacing: '.03em',
        maxWidth: '400px',
        textAlign: 'center',
        lineHeight: '1.7',
      }}>
        Este template está en desarrollo. Las fases 2-6 construirán el diseño moderno con todos los componentes de conversión.
      </p>
    </div>
  )
}
