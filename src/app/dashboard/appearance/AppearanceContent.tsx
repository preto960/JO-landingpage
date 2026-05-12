'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Check, Monitor, Smartphone, Globe, Loader2, ArrowLeft, RotateCcw } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'

type TemplateInfo = {
  id: string
  name: string
  description: string
  accent: string
  badge?: string
  preview: string[]
}

const TEMPLATES: TemplateInfo[] = [
  {
    id: 'v1-luxury',
    name: 'JO Luxury',
    description: 'Diseño elegante oscuro con acentos dorados, tipografía serif y estética premium. Ideal para transmitir exclusividad y confianza.',
    accent: '#C9A84C',
    badge: 'Actual',
    preview: [
      'Paleta: Negro (#0A0A0A) + Dorado (#C9A84C)',
      'Fuentes: Cormorant Garamond + Jost',
      'Secciones: Hero, Servicios, Beneficios, CTA',
      'Estilo: Minimalista lujo con animaciones suaves',
    ],
  },
  {
    id: 'v2-modern',
    name: 'JO Modern',
    description: 'Rediseño moderno enfocado en conversión. Mockups reales, social proof, tabla de precios, FAQ y elementos de conversión optimizados.',
    accent: '#60a5fa',
    badge: 'Nuevo',
    preview: [
      'Paleta: Oscuro + Dorado sólido + Acentos modernos',
      'Fuentes: Jost principal, Cormorant decorativo',
      'Secciones: Hero con mockup, Precios, FAQ, Testimonios',
      'Elementos: WhatsApp flotante, sticky CTA, social proof',
    ],
  },
]

export default function AppearanceContent({ user }: { user: { name: string; email: string; role?: string; permissions?: string[] } }) {
  const router = useRouter()
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/site-config')
      if (res.ok) {
        const data = await res.json()
        setActiveTemplate(data.template || 'v1-luxury')
      }
    } catch {
      // Use default
      setActiveTemplate('v1-luxury')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSelectTemplate = async (templateId: string) => {
    if (templateId === activeTemplate) return
    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'template', value: templateId }),
      })

      if (res.ok) {
        setActiveTemplate(templateId)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      // Error handled silently
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#C9A84C' }} />
          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.05em' }}>
            Cargando configuración...
          </span>
        </div>
      </div>
    )
  }

  return (
    <PermissionGate permission="appearance.edit">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => router.push('/dashboard/config')}
                className="transition-colors duration-200"
                style={{ color: 'rgba(245,240,232,.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1
                className="text-2xl sm:text-3xl font-light tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
              >
                Apariencia
              </h1>
            </div>
            <p
              className="text-sm ml-7"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.03em' }}
            >
              Selecciona el diseño visual de tu landing page
            </p>
          </div>
          {saving && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#C9A84C' }} />
              <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Guardando...
              </span>
            </div>
          )}
          {saved && !saving && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)' }}>
              <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} />
              <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: '#22c55e', letterSpacing: '.05em', textTransform: 'uppercase' }}>
                Guardado
              </span>
            </div>
          )}
        </div>

        {/* Template Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TEMPLATES.map((template) => {
            const isActive = activeTemplate === template.id

            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                disabled={saving}
                className="text-left transition-all duration-300"
                style={{
                  background: isActive ? `${template.accent}08` : 'rgba(245,240,232,.02)',
                  border: isActive ? `1px solid ${template.accent}40` : '1px solid rgba(245,240,232,.06)',
                  borderRadius: '4px',
                  padding: '24px',
                  cursor: saving ? 'wait' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(245,240,232,.04)'
                    e.currentTarget.style.borderColor = `${template.accent}25`
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 8px 30px -8px ${template.accent}12`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(245,240,232,.02)'
                    e.currentTarget.style.borderColor = 'rgba(245,240,232,.06)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 flex items-center gap-1.5"
                    style={{
                      background: `${template.accent}18`,
                      borderBottomLeftRadius: '4px',
                      borderBottom: `1px solid ${template.accent}25`,
                      borderLeft: `1px solid ${template.accent}25`,
                    }}
                  >
                    <Check className="w-3 h-3" style={{ color: template.accent }} />
                    <span
                      className="text-[9px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: template.accent, letterSpacing: '.08em', textTransform: 'uppercase' }}
                    >
                      Activo
                    </span>
                  </div>
                )}

                {/* Badge */}
                {template.badge && !isActive && (
                  <div
                    className="absolute top-4 right-4 px-2 py-0.5"
                    style={{
                      background: template.badge === 'Nuevo' ? 'rgba(96,165,250,.1)' : 'rgba(245,240,232,.05)',
                      border: `1px solid ${template.badge === 'Nuevo' ? 'rgba(96,165,250,.2)' : 'rgba(245,240,232,.1)'}`,
                      borderRadius: '2px',
                    }}
                  >
                    <span
                      className="text-[9px]"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: template.badge === 'Nuevo' ? '#60a5fa' : 'rgba(245,240,232,.3)',
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {template.badge}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center mb-5"
                  style={{
                    background: `${template.accent}10`,
                    border: `1px solid ${template.accent}20`,
                    borderRadius: '4px',
                  }}
                >
                  <Palette className="w-5 h-5" style={{ color: template.accent, strokeWidth: 1.5 }} />
                </div>

                {/* Title */}
                <h3
                  className="text-lg mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: '#F5F0E8',
                    fontWeight: 400,
                    letterSpacing: '.02em',
                  }}
                >
                  {template.name}
                </h3>

                {/* Description */}
                <p
                  className="text-xs leading-relaxed mb-5"
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    color: 'rgba(245,240,232,.4)',
                    letterSpacing: '.02em',
                    lineHeight: '1.7',
                  }}
                >
                  {template.description}
                </p>

                {/* Preview details */}
                <div className="space-y-2">
                  {template.preview.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-[11px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}
                    >
                      <span style={{ color: template.accent, marginTop: '1px' }}>—</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div
                  className="mt-6 pt-4 flex items-center gap-2"
                  style={{ borderTop: '1px solid rgba(245,240,232,.05)' }}
                >
                  {isActive ? (
                    <span
                      className="flex items-center gap-1.5 text-[10px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: template.accent, letterSpacing: '.08em', textTransform: 'uppercase' }}
                    >
                      <Monitor className="w-3 h-3" />
                      Template en uso
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 text-[10px]"
                      style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}
                    >
                      <Globe className="w-3 h-3" />
                      Click para activar
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Info note */}
        <div
          className="p-4 flex items-start gap-3"
          style={{
            background: 'rgba(245,240,232,.02)',
            border: '1px solid rgba(245,240,232,.06)',
            borderRadius: '4px',
          }}
        >
          <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(245,240,232,.25)', strokeWidth: 1.5 }} />
          <div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.35)', letterSpacing: '.02em' }}
            >
              El cambio de template se aplica inmediatamente en la landing page pública. Puedes volver al template anterior en cualquier momento seleccionándolo aquí.
            </p>
          </div>
        </div>
      </div>
    </PermissionGate>
  )
}
