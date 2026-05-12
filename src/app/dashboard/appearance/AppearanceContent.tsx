'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Palette, Check, Monitor, Globe, Loader2, ArrowLeft, RotateCcw,
  Image as ImageIcon, Upload, X, Eye, EyeOff, Pipette, Info, Save
} from 'lucide-react'
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
      'Elementos: WhatsApp flotante, sticky CTA',
    ],
  },
]

// ─── Section config for V2 template ─────────────────
type SectionToggle = {
  key: string
  label: string
  description: string
  defaultOn: boolean
}

const V2_SECTIONS: SectionToggle[] = [
  { key: 'show_testimonials', label: 'Testimonios', description: 'Sección de testimonios de clientes (mostrar solo cuando tengas testimonios reales)', defaultOn: false },
]

export default function AppearanceContent({ user }: { user: { name: string; email: string; role?: string; permissions?: string[] } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Config state
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Upload state
  const [uploading, setUploading] = useState(false)

  // Active section tab
  const [activeTab, setActiveTab] = useState<'template' | 'colors' | 'branding' | 'sections'>('template')

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/site-config')
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const updateConfig = async (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
    setSaving(true)
    try {
      await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* ignore */ }
    finally { setSaving(false) }
  }

  const handleSelectTemplate = async (templateId: string) => {
    if (templateId === config.template) return
    await updateConfig('template', templateId)
  }

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/site-assets', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        await updateConfig('site_logo', data.url)
      }
    } catch { /* ignore */ }
    finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeLogo = () => {
    updateConfig('site_logo', '')
  }

  // ─── Section toggles only make sense when V2 is active ───
  const isV2 = config.template === 'v2-modern'

  // ─── Loading ───
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: '#C9A84C' }} />
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(245,240,232,.4)', letterSpacing: '.05em' }}>
            Cargando configuración...
          </span>
        </div>
      </div>
    )
  }

  // ─── Tab button style ───
  const tabBtn = (tabId: 'template' | 'colors' | 'branding' | 'sections', label: string, icon: any) => {
    const isActive = activeTab === tabId
    const Icon = icon
    return (
      <button
        onClick={() => setActiveTab(tabId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          fontFamily: "'Jost', sans-serif",
          fontSize: 11,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: isActive ? '#C9A84C' : 'rgba(245,240,232,.35)',
          background: isActive ? 'rgba(201,168,76,.06)' : 'transparent',
          border: isActive ? '1px solid rgba(201,168,76,.15)' : '1px solid transparent',
          borderRadius: 4,
          cursor: 'pointer',
          transition: 'all .2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.color = 'rgba(245,240,232,.6)'
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.color = 'rgba(245,240,232,.35)'
        }}
      >
        <Icon style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
        {label}
      </button>
    )
  }

  // ─── Color picker input ───
  const colorField = (label: string, key: string, description: string) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(245,240,232,.02)',
        border: '1px solid rgba(245,240,232,.06)',
        borderRadius: 6,
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#F5F0E8', letterSpacing: '.03em', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}>
          {description}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.25)', letterSpacing: '.05em' }}>
          {config[key] || '#C9A84C'}
        </span>
        <div style={{ position: 'relative' }}>
          <input
            type="color"
            value={config[key] || '#C9A84C'}
            onChange={(e) => updateConfig(key, e.target.value)}
            style={{
              width: 36,
              height: 36,
              border: '2px solid rgba(245,240,232,.1)',
              borderRadius: 6,
              cursor: 'pointer',
              background: 'transparent',
              padding: 2,
            }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <PermissionGate permission="appearance.edit">
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 40px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => router.push('/dashboard/config')}
                style={{ color: 'rgba(245,240,232,.3)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color .2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
              </button>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.75rem', fontWeight: 300, color: '#F5F0E8', letterSpacing: '.02em' }}>
                Apariencia
              </h1>
            </div>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: 'rgba(245,240,232,.4)', letterSpacing: '.03em', marginLeft: 28 }}>
              Personaliza el diseño y contenido de tu landing page
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {saving && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 4 }}>
                <Loader2 className="animate-spin" style={{ width: 12, height: 12, color: '#C9A84C' }} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: '#C9A84C', letterSpacing: '.05em', textTransform: 'uppercase' }}>Guardando...</span>
              </div>
            )}
            {saved && !saving && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 4 }}>
                <Check style={{ width: 12, height: 12, color: '#22c55e' }} />
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: '#22c55e', letterSpacing: '.05em', textTransform: 'uppercase' }}>Guardado</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', borderBottom: '1px solid rgba(245,240,232,.06)', paddingBottom: 16 }}>
          {tabBtn('template', 'Template', Palette)}
          {tabBtn('colors', 'Colores', Pipette)}
          {tabBtn('branding', 'Logo e Imágenes', ImageIcon)}
          {tabBtn('sections', 'Secciones', Eye)}
        </div>

        {/* ═══════════ TAB: Template ═══════════ */}
        {activeTab === 'template' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {TEMPLATES.map((template) => {
              const isActive = config.template === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  disabled={saving}
                  style={{
                    textAlign: 'left',
                    background: isActive ? `${template.accent}08` : 'rgba(245,240,232,.02)',
                    border: isActive ? `1px solid ${template.accent}40` : '1px solid rgba(245,240,232,.06)',
                    borderRadius: 6,
                    padding: 24,
                    cursor: saving ? 'wait' : 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all .3s ease',
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
                  {isActive && (
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: `${template.accent}18`, borderBottomLeftRadius: 4, borderBottom: `1px solid ${template.accent}25`, borderLeft: `1px solid ${template.accent}25`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check style={{ width: 12, height: 12, color: template.accent }} />
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: template.accent, letterSpacing: '.08em', textTransform: 'uppercase' }}>Activo</span>
                    </div>
                  )}
                  <div style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: `${template.accent}10`, border: `1px solid ${template.accent}20`, borderRadius: 6 }}>
                    <Palette style={{ width: 20, height: 20, color: template.accent, strokeWidth: 1.5 }} />
                  </div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', color: '#F5F0E8', fontWeight: 400, letterSpacing: '.02em', marginBottom: 8 }}>
                    {template.name}
                  </h3>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(245,240,232,.4)', letterSpacing: '.02em', lineHeight: 1.7, marginBottom: 20 }}>
                    {template.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {template.preview.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'start', gap: 8, fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}>
                        <span style={{ color: template.accent, marginTop: 1 }}>—</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ═══════════ TAB: Colors ═══════════ */}
        {activeTab === 'colors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Info style={{ width: 14, height: 14, color: 'rgba(245,240,232,.25)', strokeWidth: 1.5 }} />
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}>
                Los colores se aplican al Template JO Modern. Selecciona el template V2 para ver los cambios.
              </p>
            </div>
            {colorField('Color primario', 'primary_color', 'Color principal del sitio (botones, acentos, CTAs)')}
            {colorField('Color secundario', 'secondary_color', 'Color secundario para badges y elementos decorativos')}
          </div>
        )}

        {/* ═══════════ TAB: Branding ═══════════ */}
        {activeTab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
            {/* Logo upload */}
            <div style={{ padding: 24, background: 'rgba(245,240,232,.02)', border: '1px solid rgba(245,240,232,.06)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#F5F0E8', letterSpacing: '.03em', marginBottom: 4 }}>
                    Logo del sitio
                  </p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}>
                    Se muestra en la barra de navegación y el footer (JPG, PNG, WebP, SVG — max 2MB)
                  </p>
                </div>
              </div>

              {/* Preview */}
              {config.site_logo ? (
                <div style={{ marginBottom: 16, padding: 20, background: '#0A0A0A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img
                    src={config.site_logo}
                    alt="Logo preview"
                    style={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain' }}
                  />
                  <button
                    onClick={removeLogo}
                    style={{
                      position: 'absolute', top: 8, right: 8, width: 24, height: 24,
                      background: 'rgba(248,113,113,.15)', border: '1px solid rgba(248,113,113,.2)',
                      borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#f87171',
                    }}
                    title="Eliminar logo"
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: 16, padding: 32, background: '#0A0A0A', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(245,240,232,.08)' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: 'rgba(245,240,232,.15)' }}>JO</span>
                </div>
              )}

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleUploadLogo}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '10px 16px',
                  background: uploading ? 'rgba(201,168,76,.05)' : 'rgba(201,168,76,.08)',
                  border: '1px solid rgba(201,168,76,.15)',
                  borderRadius: 4, cursor: uploading ? 'wait' : 'pointer',
                  fontFamily: "'Jost', sans-serif", fontSize: 12, color: '#C9A84C',
                  letterSpacing: '.06em', textTransform: 'uppercase',
                  transition: 'all .2s ease',
                }}
                onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.background = 'rgba(201,168,76,.12)' }}
                onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.background = 'rgba(201,168,76,.08)' }}
              >
                {uploading ? (
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                ) : (
                  <Upload style={{ width: 14, height: 14, strokeWidth: 1.5 }} />
                )}
                {uploading ? 'Subiendo...' : (config.site_logo ? 'Cambiar logo' : 'Subir logo')}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: Sections ═══════════ */}
        {activeTab === 'sections' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
            {!isV2 ? (
              <div style={{ padding: 20, background: 'rgba(245,240,232,.02)', border: '1px solid rgba(245,240,232,.06)', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Info style={{ width: 16, height: 16, color: 'rgba(245,240,232,.25)', strokeWidth: 1.5, flexShrink: 0 }} />
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em', lineHeight: 1.6 }}>
                  La gestión de secciones está disponible solo para el Template JO Modern. Selecciona el template V2 en la pestaña Template para activar esta opción.
                </p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 4 }}>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#F5F0E8', letterSpacing: '.03em', marginBottom: 4 }}>
                    Secciones visibles
                  </p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em' }}>
                    Activa o desactiva secciones del template. Las secciones desactivadas no se muestran en la landing page.
                  </p>
                </div>

                {V2_SECTIONS.map((section) => {
                  const isOn = config[section.key] === 'true' || (config[section.key] === undefined && section.defaultOn)
                  return (
                    <div
                      key={section.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px',
                        background: isOn ? 'rgba(201,168,76,.04)' : 'rgba(245,240,232,.02)',
                        border: isOn ? '1px solid rgba(201,168,76,.12)' : '1px solid rgba(245,240,232,.06)',
                        borderRadius: 6,
                        transition: 'all .2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {isOn ? (
                          <Eye style={{ width: 16, height: 16, color: '#C9A84C', strokeWidth: 1.5 }} />
                        ) : (
                          <EyeOff style={{ width: 16, height: 16, color: 'rgba(245,240,232,.2)', strokeWidth: 1.5 }} />
                        )}
                        <div>
                          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 13, color: '#F5F0E8', letterSpacing: '.03em' }}>
                            {section.label}
                          </p>
                          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, color: 'rgba(245,240,232,.3)', letterSpacing: '.02em', marginTop: 2 }}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateConfig(section.key, isOn ? 'false' : 'true')}
                        style={{
                          width: 44, height: 24, borderRadius: 12, padding: 2,
                          background: isOn ? '#C9A84C' : 'rgba(245,240,232,.1)',
                          border: 'none', cursor: 'pointer',
                          position: 'relative', transition: 'background .2s ease',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: isOn ? '#0A0A0A' : 'rgba(245,240,232,.4)',
                          transition: 'transform .2s ease, background .2s ease',
                          transform: isOn ? 'translateX(20px)' : 'translateX(0)',
                        }} />
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </PermissionGate>
  )
}
