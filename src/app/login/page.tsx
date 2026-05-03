'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Shield, LogIn } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const registered = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.')
        setLoading(false)
        return
      }

      if (result?.ok) {
        window.location.href = callbackUrl
        return
      }

      signIn('credentials', {
        email,
        password,
        callbackUrl,
      })
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Error al conectar con el servidor. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#0A0A0A' }}
    >
      {/* Decorative background glows - matching landing page hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(201,168,76,.1) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,168,76,.05) 0%, transparent 50%)',
        }}
      />

      {/* Vertical decorative lines - left */}
      <div
        className="hidden sm:block absolute left-12 top-0 bottom-0 w-px opacity-0 lg:opacity-100"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,.3), transparent)' }}
      />

      {/* Vertical decorative lines - right */}
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
            Panel de administración
          </p>
        </div>

        {/* Gold divider */}
        <div
          className="w-16 h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,.5), transparent)' }}
        />

        {/* Login Card */}
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
              <LogIn className="w-5 h-5" style={{ color: '#C9A84C' }} />
            </div>
            <h2
              className="text-2xl font-light mb-2"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
            >
              Iniciar Sesión
            </h2>
            <p
              className="text-sm"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.45)' }}
            >
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {registered && (
              <div
                className="border p-3 text-sm text-center"
                style={{
                  background: 'rgba(34,197,94,.05)',
                  borderColor: 'rgba(34,197,94,.2)',
                  color: '#4ade80',
                }}
              >
                Cuenta creada exitosamente. Ya puedes iniciar sesión.
              </div>
            )}

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
              <label
                htmlFor="email"
                className="text-xs uppercase tracking-[.12em]"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: 'rgba(245,240,232,.55)',
                }}
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 text-sm font-light transition-colors duration-300"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: 'rgba(10,10,10,.6)',
                  border: '1px solid rgba(245,240,232,.07)',
                  color: '#F5F0E8',
                  caretColor: '#C9A84C',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(201,168,76,.4)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(245,240,232,.07)'
                }}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs uppercase tracking-[.12em]"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  color: 'rgba(245,240,232,.55)',
                }}
              >
                Contraseña
              </label>
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
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    background: 'rgba(10,10,10,.6)',
                    border: '1px solid rgba(245,240,232,.07)',
                    color: '#F5F0E8',
                    caretColor: '#C9A84C',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(201,168,76,.4)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(245,240,232,.07)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                  style={{ color: 'rgba(245,240,232,.3)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 text-xs uppercase tracking-[.18em] font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                fontFamily: "'Jost', sans-serif",
                background: loading ? 'rgba(201,168,76,.7)' : '#C9A84C',
                color: '#0A0A0A',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#E8C97A'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#C9A84C'
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
                  Ingresando...
                </span>
              ) : (
                'Ingresar al Panel'
              )}
            </button>
          </form>
        </div>

        {/* Footer security text */}
        <p
          className="text-center text-xs mt-8 flex items-center justify-center gap-1.5"
          style={{
            fontFamily: "'Jost', sans-serif",
            color: 'rgba(245,240,232,.25)',
          }}
        >
          <Shield className="w-3 h-3" />
          Conexión segura y encriptada
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
          <div className="w-6 h-6 border rounded-full animate-spin" style={{ borderColor: 'rgba(201,168,76,.2)', borderTopColor: '#C9A84C' }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
