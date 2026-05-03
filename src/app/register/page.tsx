'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Loader2, Shield, UserPlus, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Password strength indicators
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

      // Redirect to login with success message (avoid signIn issues with Next.js 16)
      router.push('/login?registered=true')
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const strengthColor = passwordStrength <= 1 ? 'bg-red-500' : passwordStrength <= 2 ? 'bg-orange-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500'
  const strengthText = passwordStrength <= 1 ? 'Débil' : passwordStrength <= 2 ? 'Regular' : passwordStrength <= 3 ? 'Buena' : 'Excelente'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              JO<span className="text-blue-400">-Shop</span>
            </h1>
          </Link>
          <p className="text-gray-400 mt-2 text-sm">Crea tu cuenta de administrador</p>
        </div>

        <Card className="bg-gray-900/80 border-gray-800 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
              <UserPlus className="w-6 h-6 text-purple-400" />
            </div>
            <CardTitle className="text-xl text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-400">
              Regístrate para gestionar tu tienda
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
                <Label htmlFor="name" className="text-gray-300 text-sm">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={loading}
                />
              </div>

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

                {/* Password strength */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strengthColor} rounded-full transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 min-w-[60px]">{strengthText}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className={`flex items-center gap-1.5 text-xs ${hasMinLength ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        8+ caracteres
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${hasUpperCase ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Una mayúscula
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${hasNumber ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Un número
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs ${hasSpecial ? 'text-green-400' : 'text-gray-500'}`}>
                        {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        Un especial (!@#$)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 text-sm">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading || passwordStrength < 4}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
              <p className="text-center text-sm text-gray-400">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Iniciar sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3 h-3" />
          Tus datos están protegidos con encriptación
        </p>
      </div>
    </div>
  )
}
