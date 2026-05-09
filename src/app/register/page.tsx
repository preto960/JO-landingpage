'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Shield, UserPlus, Check, X } from 'lucide-react'

const inputBase: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '.85rem',
  fontWeight: 300,
  lineHeight: '1.5',
  width: '100%',
  height: '2.75rem',
  padding: '0 .875rem',
  background: 'rgba(10,10,10,.6)',
  border: '1px solid rgba(245,240,232,.07)',
  borderRadius: 0,
  color: '#F5F0E8',
  caretColor: '#C9A84C',
  outline: 'none',
  transition: 'border-color .3s ease',
  boxSizing: 'border-box',
}

const labelBase: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '.7rem',
  fontWeight: 400,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,232,.55)',
  display: 'block',
  marginBottom: '.5rem',
}

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordStrength = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return }
    if (passwordStrength < 4) { setError('La contraseña no cumple todos los requisitos'); return }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.details) {
          const messages = Object.values(data.details).flat() as string[]
          setError(messages.join('. '))
        } else {
          setError(data.error || 'Error al crear la cuenta')
        }
        return
      }
      router.push('/login?registered=true')
    } catch {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)'
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444'
    if (passwordStrength <= 2) return '#f97316'
    if (passwordStrength <= 3) return '#eab308'
    return '#22c55e'
  }
  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Débil'
    if (passwordStrength <= 2) return 'Regular'
    if (passwordStrength <= 3) return 'Buena'
    return 'Excelente'
  }

  const goldBtn: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: '.78rem',
    fontWeight: 500,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    width: '100%',
    height: '3rem',
    marginTop: '.5rem',
    background: '#C9A84C',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'background .3s, transform .1s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden', background: '#0A0A0A' }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(201,168,76,.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(201,168,76,.05) 0%, transparent 50%)' }} />

      {/* Vertical lines - hidden on mobile */}
      <div className="hidden sm:block" style={{ position: 'absolute', left: '3rem', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.3), transparent)' }} />
      <div className="hidden sm:block" style={{ position: 'absolute', right: '3rem', top: 0, bottom: 0, width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.3), transparent)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '28rem' }}>
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-10">
          <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
            <h1 className="text-[2rem] sm:text-[2.5rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>
              <span style={{ color: '#C9A84C' }}>JO</span>
            </h1>
          </Link>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,.45)', marginTop: '.75rem' }}>
            Crea tu cuenta
          </p>
        </div>

        {/* Gold divider */}
        <div className="mx-auto mb-5 sm:mb-8" style={{ width: '4rem', height: '1px', background: 'linear-gradient(to right, transparent, rgba(201,168,76,.5), transparent)' }} />

        {/* Card */}
        <div className="p-5 sm:p-8" style={{ background: 'rgba(28,28,28,.4)', border: '1px solid rgba(245,240,232,.07)', backdropFilter: 'blur(20px)' }}>
          <div className="text-center mb-6 sm:mb-8">
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '1px solid rgba(201,168,76,.2)', background: 'rgba(201,168,76,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <UserPlus style={{ width: '1.25rem', height: '1.25rem', color: '#C9A84C' }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 300, color: '#F5F0E8', margin: '0 0 .5rem' }}>
              Crear Cuenta
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', fontWeight: 300, color: 'rgba(245,240,232,.45)', margin: 0 }}>
              Regístrate para acceder al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {error && (
              <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', padding: '.75rem', textAlign: 'center', fontSize: '.85rem', fontFamily: "'Jost', sans-serif", color: '#f87171' }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" style={labelBase}>Nombre completo</label>
              <input id="name" type="text" placeholder="Juan Pérez" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} style={{ ...inputBase, opacity: loading ? 0.5 : 1 }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label htmlFor="email" style={labelBase}>Email</label>
              <input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} style={{ ...inputBase, opacity: loading ? 0.5 : 1 }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <div>
              <label htmlFor="password" style={labelBase}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} style={{ ...inputBase, paddingRight: '2.5rem', opacity: loading ? 0.5 : 1 }} onFocus={handleFocus} onBlur={handleBlur} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(245,240,232,.3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}>
                  {showPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(245,240,232,.07)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(passwordStrength / 4) * 100}%`, background: getStrengthColor(), transition: 'width .3s' }} />
                    </div>
                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: 'rgba(245,240,232,.35)', minWidth: '3.75rem', textAlign: 'right' }}>{getStrengthText()}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.375rem' }}>
                    {[
                      { label: '8+ caracteres', met: hasMinLength },
                      { label: 'Una mayúscula', met: hasUpperCase },
                      { label: 'Un número', met: hasNumber },
                      { label: 'Un especial (!@#$)', met: hasSpecial },
                    ].map((req) => (
                      <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: req.met ? '#4ade80' : 'rgba(245,240,232,.25)' }}>
                        {req.met ? <Check style={{ width: '.75rem', height: '.75rem' }} /> : <X style={{ width: '.75rem', height: '.75rem' }} />}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" style={labelBase}>Confirmar contraseña</label>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} style={{ ...inputBase, opacity: loading ? 0.5 : 1 }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            <button type="submit" disabled={loading || passwordStrength < 4} style={{ ...goldBtn, opacity: (loading || passwordStrength < 4) ? 0.4 : 1, cursor: (loading || passwordStrength < 4) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (!loading && passwordStrength >= 4) e.currentTarget.style.background = '#E8C97A' }} onMouseLeave={(e) => { if (!loading && passwordStrength >= 4) e.currentTarget.style.background = '#C9A84C' }} onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.98)' }} onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                  <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                  Creando cuenta...
                </span>
              ) : 'Crear Cuenta'}
            </button>

            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.45)', textAlign: 'center', margin: '.25rem 0 0' }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" style={{ color: '#C9A84C', textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#E8C97A')} onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A84C')}>
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 sm:mt-8" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: 'rgba(245,240,232,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.375rem' }}>
          <Shield style={{ width: '.75rem', height: '.75rem' }} />
          Tus datos están protegidos con encriptación
        </p>
      </div>
    </div>
  )
}
