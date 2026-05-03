'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Check, X, Loader2, Shield, UserPlus } from 'lucide-react'

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

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (passwordStrength < 4) {
      setError('La contraseña no cumple todos los requisitos')
      return
    }

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
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
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

  const inputStyle = {
    fontFamily: "'Jost', sans-serif",
    background: 'rgba(10,10,10,.6)',
    border: '1px solid rgba(245,240,232,.07)',
    color: '#F5F0E8',
    caretColor: '#C9A84C',
  } as React.CSSProperties

  const labelStyle = {
    fontFamily: "'Jost', sans-serif",
    color: 'rgba(245,240,232,.55)',
    fontSize: '.7rem',
    letterSpacing: '.12em',
    textTransform: 'uppercase' as const,
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Decorative background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(201,168,76,.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(201,168,76,.05) 0%, transparent 50%)',
        }}
      />

      {/* Vertical decorative lines */}
      <div
        className="hidden sm:block absolute left-12 top-0 bottom-0 w-px opacity-0 lg:opacity-100"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.3), transparent)' }}
      />
      <div
        className="hidden sm:block absolute right-12 top-0 bottom-0 w-px opacity-0 lg:opacity-100"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.3), transparent)' }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <h1
              className="text-4xl font-light tracking-wide"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: '#F5F0E8',
              }}
            >
              <span style={{ color: '#C9A84C' }}>JO</span>
            </h1>
          </Link>
          <p
            className="mt-3 text-xs uppercase tracking-[.18em]"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: 'rgba(245,240,232,.45)',
            }}
          >
            Crea tu cuenta de administrador
          </p>
        </div>

        {/* Gold divider */}
        <div
          className="w-16 h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,.5), transparent)' }}
        />

        {/* Register Card */}
        <div
          className="border p-8 sm:p-10"
          style={{
            background: 'rgba(28,28,28,.4)',
            borderColor: 'rgba(245,240,232,.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ border: '1px solid rgba(201,168,76,.2)', background: 'rgba(201,168,76,.05)' }}
            >
              <UserPlus className="w-5 h-5" style={{ color: '#C9A84C' }} />
            </div>
            <h2
              className="text-2xl font-light mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
            >
              Crear Cuenta
            </h2>
            <p
              className="text-sm"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.45)' }}
            >
              Regístrate para gestionar tu panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="border p-3 text-sm text-center"
                style={{
                  background: 'rgba(239,68,68,.05)',
                  borderColor: 'rgba(239,68,68,.2)',
                  color: '#f87171',
                }}
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" style={labelStyle}>Nombre completo</label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-11 text-sm font-light transition-colors duration-300"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" style={labelStyle}>Email</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 text-sm font-light transition-colors duration-300"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" style={labelStyle}>Contraseña</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 text-sm font-light pr-10 transition-colors duration-300"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: 'rgba(245,240,232,.3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
                >
                  {showPassword ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="space-y-2.5 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px overflow-hidden" style={{ background: 'rgba(245,240,232,.07)' }}>
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(passwordStrength / 4) * 100}%`,
                          background: getStrengthColor(),
                        }}
                      />
                    </div>
                    <span
                      className="text-xs min-w-[60px] text-right"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.35)',
                      }}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: '8+ caracteres', met: hasMinLength },
                      { label: 'Una mayúscula', met: hasUpperCase },
                      { label: 'Un número', met: hasNumber },
                      { label: 'Un especial (!@#$)', met: hasSpecial },
                    ].map((req) => (
                      <div
                        key={req.label}
                        className="flex items-center gap-1.5 text-xs"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color: req.met ? '#4ade80' : 'rgba(245,240,232,.25)',
                        }}
                      >
                        {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" style={labelStyle}>Confirmar contraseña</label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 text-sm font-light transition-colors duration-300"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || passwordStrength < 4}
              className="w-full h-12 mt-2 text-xs uppercase tracking-[.18em] font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: "'Jost', sans-serif",
                background: loading ? 'rgba(201,168,76,.7)' : '#C9A84C',
                color: '#0A0A0A',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!loading && passwordStrength >= 4) e.currentTarget.style.background = '#E8C97A'
              }}
              onMouseLeave={(e) => {
                if (!loading && passwordStrength >= 4) e.currentTarget.style.background = '#C9A84C'
              }}
              onMouseDown={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.98)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>

            <p
              className="text-center text-sm mt-4"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.45)' }}
            >
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="transition-colors duration-200"
                style={{ color: '#C9A84C' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E8C97A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#C9A84C')}
              >
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-8 flex items-center justify-center gap-1.5"
          style={{
            fontFamily: "'Jost', sans-serif",
            color: 'rgba(245,240,232,.25)',
          }}
        >
          <Shield className="w-3 h-3" />
          Tus datos están protegidos con encriptación
        </p>
      </div>
    </div>
  )
}
