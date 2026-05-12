'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'rgba(245, 240, 232, 0.04)',
  border: '1px solid rgba(245, 240, 232, 0.08)',
  borderRadius: '4px',
  color: '#F5F0E8',
  fontSize: '13px',
  fontFamily: 'Jost, sans-serif',
  outline: 'none',
  transition: 'border-color 0.25s ease',
  boxSizing: 'border-box',
}

const selectBase: React.CSSProperties = {
  ...inputBase,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(245,240,232,0.35)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '40px',
  cursor: 'pointer',
}

export default function V2CTA() {
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [tipoNegocio, setTipoNegocio] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section
      id="contacto"
      ref={sectionRef}
      style={{
        padding: '80px 24px',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {/* Decorative top border */}
        <div
          style={{
            height: '2px',
            background: 'linear-gradient(to right, transparent, #C9A84C, transparent)',
            marginBottom: '48px',
          }}
        />

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '10px',
            color: '#C9A84C',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: '0 0 12px 0',
          }}
        >
          ¿LISTO PARA EMPEZAR?
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '2.2rem',
            fontWeight: 300,
            color: '#F5F0E8',
            textAlign: 'center',
            marginTop: '12px',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.2,
          }}
        >
          Tu próxima venta puede ser en línea. Hoy.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '14px',
            color: 'rgba(245, 240, 232, 0.4)',
            textAlign: 'center',
            marginTop: '10px',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6,
          }}
        >
          Agenda una consulta gratuita y te mostramos cómo tu negocio puede
          vender más en línea.
        </p>

        {/* Trust elements */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '24px',
            flexWrap: 'wrap',
          }}
        >
          {/* Shield */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,240,232,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '11px',
                color: 'rgba(245, 240, 232, 0.35)',
              }}
            >
              Garantía 60 días
            </span>
          </div>

          {/* Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,240,232,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '11px',
                color: 'rgba(245, 240, 232, 0.35)',
              }}
            >
              Respuesta en {'<'} 2 horas
            </span>
          </div>

          {/* Check */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(245,240,232,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span
              style={{
                fontFamily: 'Jost, sans-serif',
                fontSize: '11px',
                color: 'rgba(245, 240, 232, 0.35)',
              }}
            >
              Sin compromiso
            </span>
          </div>
        </div>

        {/* Form or Success */}
        <div style={{ marginTop: '32px', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto' }}>
          {submitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '16px' }}
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '14px',
                  color: '#22c55e',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                ✓ ¡Solicitud enviada! Te contactaremos pronto por WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Nombre */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  style={{
                    ...inputBase,
                    borderColor: undefined,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84C'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.08)'
                  }}
                />
              </div>

              {/* WhatsApp */}
              <div style={{ marginBottom: '12px', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '15px',
                    pointerEvents: 'none',
                    lineHeight: 1,
                  }}
                >
                  📱
                </span>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+58 412 1234567"
                  required
                  style={{
                    ...inputBase,
                    paddingLeft: '40px',
                    borderColor: undefined,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84C'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.08)'
                  }}
                />
              </div>

              {/* Tipo de negocio */}
              <div style={{ marginBottom: '0' }}>
                <select
                  value={tipoNegocio}
                  onChange={(e) => setTipoNegocio(e.target.value)}
                  required
                  style={{
                    ...selectBase,
                    borderColor: undefined,
                    color: tipoNegocio ? '#F5F0E8' : 'rgba(245, 240, 232, 0.2)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#C9A84C'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245, 240, 232, 0.08)'
                  }}
                >
                  <option value="" disabled>
                    Selecciona...
                  </option>
                  <option value="ropa">Tienda de ropa</option>
                  <option value="food">Restaurante/Food</option>
                  <option value="servicios">Servicios profesionales</option>
                  <option value="tech">Tecnología</option>
                  <option value="belleza">Belleza/Salud</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px 32px',
                  backgroundColor: '#C9A84C',
                  color: '#0A0A0A',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '16px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B85C'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#C9A84C'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = '#BF9E44'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B85C'
                }}
              >
                Agendar Consulta Gratis
              </button>

              {/* Below button note */}
              <p
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '11px',
                  color: 'rgba(245, 240, 232, 0.25)',
                  textAlign: 'center',
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                Te contactamos por WhatsApp en menos de 2 horas
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="rgba(245,240,232,0.25)"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
