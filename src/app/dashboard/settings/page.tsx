'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Loader2, User, Key, LogOut, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  background: 'rgba(10,10,10,.6)',
  border: '1px solid rgba(245,240,232,.07)',
  color: '#F5F0E8',
  caretColor: '#C9A84C',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  color: 'rgba(245,240,232,.55)',
  fontSize: '.7rem',
  letterSpacing: '.12em',
  textTransform: 'uppercase' as const,
}

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [originalName, setOriginalName] = useState('')
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

  useEffect(() => {
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
  }, [])

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
        setOriginalName(name)
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

  const cardStyle: React.CSSProperties = {
    background: 'rgba(28,28,28,.3)',
    border: '1px solid rgba(245,240,232,.06)',
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1
          className="text-3xl lg:text-4xl font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
        >
          Configuración
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)' }}
        >
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Gold divider */}
      <div
        className="w-full h-px"
        style={{ background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }}
      />

      {/* Profile Section */}
      <div className="p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              border: '1px solid rgba(201,168,76,.15)',
              background: 'rgba(201,168,76,.05)',
            }}
          >
            <User className="w-5 h-5" style={{ color: '#C9A84C', strokeWidth: 1.5 }} />
          </div>
          <div>
            <h2
              className="text-lg font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
            >
              Perfil
            </h2>
            <p
              className="text-xs uppercase tracking-[.1em]"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
            >
              Tu información personal
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-5">
          {profileMessage && (
            <div
              className="border p-3 text-sm flex items-center gap-2"
              style={{
                background: 'rgba(34,197,94,.05)',
                borderColor: 'rgba(34,197,94,.15)',
                color: '#4ade80',
                fontFamily: "'Jost', sans-serif",
              }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {profileMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" style={labelStyle}>Nombre completo</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 text-sm font-light transition-colors duration-300"
              style={inputStyle}
              disabled={saving}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="settings-email" style={labelStyle}>Email</label>
            <Input
              id="settings-email"
              value={email}
              disabled
              className="h-11 text-sm font-light cursor-not-allowed"
              style={{
                ...inputStyle,
                opacity: 0.5,
                color: 'rgba(245,240,232,.35)',
              }}
            />
            <p
              className="text-[10px] mt-1"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}
            >
              El email no se puede cambiar
            </p>
          </div>

          <div className="space-y-2">
            <label style={labelStyle}>Rol</label>
            <Input
              value={role === 'admin' ? 'Administrador' : 'Usuario'}
              disabled
              className="h-11 text-sm font-light cursor-not-allowed"
              style={{
                ...inputStyle,
                opacity: 0.5,
                color: 'rgba(245,240,232,.35)',
              }}
            />
          </div>

          <button
            type="submit"
            className="h-11 px-6 text-xs uppercase tracking-[.18em] font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-2"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: '#C9A84C',
              color: '#0A0A0A',
              border: 'none',
            }}
            disabled={saving || name === originalName}
            onMouseEnter={(e) => {
              if (!saving && name !== originalName) e.currentTarget.style.background = '#E8C97A'
            }}
            onMouseLeave={(e) => {
              if (!saving && name !== originalName) e.currentTarget.style.background = '#C9A84C'
            }}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                Guardar Cambios
              </>
            )}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              border: '1px solid rgba(201,168,76,.15)',
              background: 'rgba(201,168,76,.05)',
            }}
          >
            <Key className="w-5 h-5" style={{ color: '#E8C97A', strokeWidth: 1.5 }} />
          </div>
          <div>
            <h2
              className="text-lg font-light"
              style={{ fontFamily: "'Cormorant Garamond", serif', color: '#F5F0E8' }}
            >
              Cambiar Contraseña
            </h2>
            <p
              className="text-xs uppercase tracking-[.1em]"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
            >
              Actualiza tu contraseña de acceso
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          {passwordError && (
            <div
              className="border p-3 text-sm text-center"
              style={{
                background: 'rgba(239,68,68,.05)',
                borderColor: 'rgba(239,68,68,.15)',
                color: '#f87171',
                fontFamily: "'Jost', sans-serif",
              }}
            >
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div
              className="border p-3 text-sm flex items-center gap-2"
              style={{
                background: 'rgba(34,197,94,.05)',
                borderColor: 'rgba(34,197,94,.15)',
                color: '#4ade80',
                fontFamily: "'Jost', sans-serif",
              }}
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {passwordMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="current-password" style={labelStyle}>Contraseña actual</label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={changingPassword}
                className="h-11 text-sm font-light pr-10 transition-colors duration-300"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: 'rgba(245,240,232,.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Separator */}
          <div
            className="h-px"
            style={{ background: 'rgba(245,240,232,.06)' }}
          />

          <div className="space-y-2">
            <label htmlFor="new-password" style={labelStyle}>Nueva contraseña</label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={changingPassword}
                className="h-11 text-sm font-light pr-10 transition-colors duration-300"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: 'rgba(245,240,232,.3)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-new-password" style={labelStyle}>Confirmar nueva contraseña</label>
            <Input
              id="confirm-new-password"
              type={showNewPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={changingPassword}
              className="h-11 text-sm font-light transition-colors duration-300"
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(201,168,76,.4)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(245,240,232,.07)' }}
            />
          </div>

          <button
            type="submit"
            className="h-11 px-6 text-xs uppercase tracking-[.18em] font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 flex items-center gap-2"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: '#C9A84C',
              color: '#0A0A0A',
              border: 'none',
            }}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            onMouseEnter={(e) => {
              if (!changingPassword && currentPassword && newPassword && confirmNewPassword)
                e.currentTarget.style.background = '#E8C97A'
            }}
            onMouseLeave={(e) => {
              if (!changingPassword && currentPassword && newPassword && confirmNewPassword)
                e.currentTarget.style.background = '#C9A84C'
            }}
          >
            {changingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
                Cambiar Contraseña
              </>
            )}
          </button>
        </form>
      </div>

      {/* Danger Zone - Session */}
      <div
        className="p-6"
        style={{
          background: 'rgba(28,28,28,.3)',
          border: '1px solid rgba(239,68,68,.1)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{
              border: '1px solid rgba(239,68,68,.15)',
              background: 'rgba(239,68,68,.05)',
            }}
          >
            <LogOut className="w-5 h-5" style={{ color: '#f87171', strokeWidth: 1.5 }} />
          </div>
          <div>
            <h2
              className="text-lg font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
            >
              Sesión
            </h2>
            <p
              className="text-xs uppercase tracking-[.1em]"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
            >
              Cierra tu sesión actual
            </p>
          </div>
        </div>

        <button
          className="h-10 px-5 text-xs uppercase tracking-[.18em] font-medium transition-all duration-300 cursor-pointer flex items-center gap-2"
          style={{
            fontFamily: "'Jost', sans-serif",
            background: 'transparent',
            color: 'rgba(248,113,113,.7)',
            border: '1px solid rgba(239,68,68,.2)',
          }}
          onClick={() => signOut({ callbackUrl: '/login' })}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)'
            e.currentTarget.style.background = 'rgba(239,68,68,.05)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(248,113,113,.7)'
          }}
        >
          <LogOut className="w-4 h-4" style={{ strokeWidth: 1.5 }} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
