'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Key, LogOut, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  // Get user data from data attribute (set by server component wrapper)
  const [name, setName] = useState('')
  const [email] = useState('')
  const [role] = useState('')
  const [originalName] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Load user data on mount from the API
  useState(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setName(data.user.name)
          setEmail(data.user.email)
          setRole(data.user.role)
          setOriginalName(data.user.name)
        }
      })
      .catch(() => {})
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setProfileMessage('')

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (response.ok) {
        setProfileMessage('Perfil actualizado correctamente')
      }
    } catch {
      setProfileMessage('')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    setChangingPassword(true)

    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage('Contraseña actualizada correctamente')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
      } else {
        setPasswordError(data.error || 'Error al cambiar la contraseña')
      }
    } catch {
      setPasswordError('Error de conexión')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 mt-1">Gestiona tu cuenta y preferencias</p>
      </div>

      {/* Profile Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Perfil</CardTitle>
              <CardDescription className="text-gray-500">
                Tu información personal
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {profileMessage && (
              <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{profileMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 text-sm">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-800/50 border-gray-700 text-white focus:border-blue-500"
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email" className="text-gray-300 text-sm">Email</Label>
              <Input
                id="settings-email"
                value={email}
                disabled
                className="bg-gray-800/30 border-gray-700 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600">El email no se puede cambiar</p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-sm">Rol</Label>
              <Input
                value={role === 'admin' ? 'Administrador' : 'Usuario'}
                disabled
                className="bg-gray-800/30 border-gray-700 text-gray-500 cursor-not-allowed"
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saving || name === originalName}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Cambiar Contraseña</CardTitle>
              <CardDescription className="text-gray-500">
                Actualiza tu contraseña de acceso
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordMessage && (
              <Alert className="bg-green-500/10 border-green-500/30 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <AlertDescription>{passwordMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-gray-300 text-sm">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 pr-10"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Separator className="bg-gray-800" />
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-300 text-sm">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 pr-10"
                  disabled={changingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-gray-300 text-sm">Confirmar nueva contraseña</Label>
              <Input
                id="confirm-new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="bg-gray-800/50 border-gray-700 text-white focus:border-blue-500"
                disabled={changingPassword}
              />
            </div>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {changingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gray-900 border-red-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">Sesión</CardTitle>
              <CardDescription className="text-gray-500">
                Cierra tu sesión actual
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
