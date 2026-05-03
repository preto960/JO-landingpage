'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Shield, LogIn } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

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
      // Step 1: Get CSRF token from next-auth
      const csrfRes = await fetch('/api/auth/csrf')
      if (!csrfRes.ok) {
        throw new Error('No se pudo obtener el token de seguridad')
      }
      const { csrfToken } = await csrfRes.json()

      // Step 2: Submit credentials directly to next-auth endpoint
      const signInRes = await fetch('/api/auth/signin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          csrfToken,
          email,
          password,
          callbackUrl,
        }).toString(),
      })

      // Step 3: Process response
      if (signInRes.ok) {
        // Check response — next-auth returns JSON with url on success
        const contentType = signInRes.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await signInRes.json()
          if (data.url) {
            // Success — hard redirect to dashboard
            window.location.replace(data.url)
            return
          }
          if (data.error) {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.')
            setLoading(false)
            return
          }
        }
        // If we got here without JSON, the Set-Cookie header was likely set
        // Do a hard redirect to dashboard
        window.location.replace(callbackUrl)
        return
      }

      // Non-ok response
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Error al conectar con el servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              JO<span className="text-blue-400">-Shop</span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Panel de administración</p>
        </div>

        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3">
              <LogIn className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-xl text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-400">
              Ingresa tus credenciales para acceder al panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 text-sm">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar al Panel'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Conexión segura y encriptada
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
