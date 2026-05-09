'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Loader2, User, Key, LogOut, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS, Role } from '@/lib/rbac'

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

const cardStyle: React.CSSProperties = {
  background: 'rgba(28,28,28,.3)',
  border: '1px solid rgba(245,240,232,.06)',
  padding: '1.5rem',
}

export default function ProfilePage() {
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
    } catch { setProfileMessage('') }
    finally { setSaving(false) }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (newPassword !== confirmNewPassword) { setPasswordError('Las contraseñas nuevas no coinciden'); return }
    if (newPassword.length < 8) { setPasswordError('La nueva contraseña debe tener al menos 8 caracteres'); return }
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
        setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('')
      } else { setPasswordError(data.error || 'Error al cambiar la contraseña') }
    } catch { setPasswordError('Error de conexión') }
    finally { setChangingPassword(false) }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)' }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)' }

  const goldBtn: React.CSSProperties = {
    fontFamily: "'Jost', sans-serif",
    fontSize: '.78rem',
    fontWeight: 500,
    letterSpacing: '.18em',
    textTransform: 'uppercase',
    height: '2.75rem',
    padding: '0 1.5rem',
    background: '#C9A84C',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: 0,
    cursor: 'pointer',
    transition: 'background .3s, transform .1s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '.5rem',
  }

  const sectionHeader = (icon: React.ReactNode, title: string, desc: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.5rem' }}>
      <div style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,.15)', background: 'rgba(201,168,76,.05)' }}>
        {icon}
      </div>
      <div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.125rem', fontWeight: 300, color: '#F5F0E8', margin: 0 }}>{title}</h2>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,.25)', margin: '.25rem 0 0' }}>{desc}</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '42rem' }}>
      {/* Header */}
      <div>
        <h1 className="text-[1.5rem] sm:text-[1.875rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>Mi <span style={{ color: '#C9A84C' }}>Perfil</span></h1>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.4)', marginTop: '.5rem' }}>Gestiona tu información personal</p>
      </div>

      {/* Gold divider */}
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }} />

      {/* Profile */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        {sectionHeader(<User style={{ width: '1.25rem', height: '1.25rem', color: '#C9A84C' }} />, 'Perfil', 'Tu información personal')}

        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4 sm:gap-5">
          {profileMessage && (
            <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', padding: '.75rem', fontSize: '.85rem', fontFamily: "'Jost', sans-serif", color: '#4ade80', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              {profileMessage}
            </div>
          )}

          <div>
            <label htmlFor="name" style={labelBase}>Nombre completo</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={saving} style={{ ...inputBase, opacity: saving ? 0.5 : 1 }} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <div>
            <label htmlFor="settings-email" style={labelBase}>Email</label>
            <input id="settings-email" value={email} disabled style={{ ...inputBase, opacity: 0.4, cursor: 'not-allowed' }} />
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', color: 'rgba(245,240,232,.2)', marginTop: '.375rem' }}>El email no se puede cambiar</p>
          </div>

          <div>
            <label style={labelBase}>Rol</label>
            <div className="flex items-center gap-2">
              <input value={ROLE_LABELS[(role as Role) || 'viewer']} disabled style={{ ...inputBase, opacity: 0.4, cursor: 'not-allowed', flex: 1 }} />
              <span className="inline-block px-2 py-0.5 flex-shrink-0" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.08em', color: ROLE_COLORS[(role as Role) || 'viewer'], background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.1)' }}>
                {ROLE_LABELS[(role as Role) || 'viewer']}
              </span>
            </div>
          </div>

          <button type="submit" disabled={saving || name === originalName} className="w-full sm:w-auto" style={{ ...goldBtn, opacity: (saving || name === originalName) ? 0.4 : 1, cursor: (saving || name === originalName) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (!saving && name !== originalName) e.currentTarget.style.background = '#E8C97A' }} onMouseLeave={(e) => { if (!saving && name !== originalName) e.currentTarget.style.background = '#C9A84C' }}>
            {saving ? (<><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />Guardando...</>) : (<><Save style={{ width: '1rem', height: '1rem' }} />Guardar Cambios</>)}
          </button>
        </form>
      </div>

      {/* Password */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        {sectionHeader(<Key style={{ width: '1.25rem', height: '1.25rem', color: '#E8C97A' }} />, 'Cambiar Contraseña', 'Actualiza tu contraseña de acceso')}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 sm:gap-5">
          {passwordError && (
            <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.15)', padding: '.75rem', fontSize: '.85rem', fontFamily: "'Jost', sans-serif", color: '#f87171' }}>{passwordError}</div>
          )}
          {passwordMessage && (
            <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', padding: '.75rem', fontSize: '.85rem', fontFamily: "'Jost', sans-serif", color: '#4ade80', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <CheckCircle2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              {passwordMessage}
            </div>
          )}

          <div>
            <label htmlFor="current-password" style={labelBase}>Contraseña actual</label>
            <div style={{ position: 'relative' }}>
              <input id="current-password" type={showCurrentPassword ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required disabled={changingPassword} style={{ ...inputBase, paddingRight: '2.5rem' }} onFocus={handleFocus} onBlur={handleBlur} />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(245,240,232,.3)', cursor: 'pointer', padding: 0, display: 'flex' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}>
                {showCurrentPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(245,240,232,.06)' }} />

          <div>
            <label htmlFor="new-password" style={labelBase}>Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={changingPassword} style={{ ...inputBase, paddingRight: '2.5rem' }} onFocus={handleFocus} onBlur={handleBlur} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(245,240,232,.3)', cursor: 'pointer', padding: 0, display: 'flex' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.6)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.3)')}>
                {showNewPassword ? <EyeOff style={{ width: '1rem', height: '1rem' }} /> : <Eye style={{ width: '1rem', height: '1rem' }} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-new-password" style={labelBase}>Confirmar nueva contraseña</label>
            <input id="confirm-new-password" type={showNewPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required disabled={changingPassword} style={inputBase} onFocus={handleFocus} onBlur={handleBlur} />
          </div>

          <button type="submit" disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword} className="w-full sm:w-auto" style={{ ...goldBtn, opacity: (changingPassword || !currentPassword || !newPassword || !confirmNewPassword) ? 0.4 : 1, cursor: (changingPassword || !currentPassword || !newPassword || !confirmNewPassword) ? 'not-allowed' : 'pointer' }} onMouseEnter={(e) => { if (!changingPassword && currentPassword && newPassword && confirmNewPassword) e.currentTarget.style.background = '#E8C97A' }} onMouseLeave={(e) => { if (!changingPassword && currentPassword && newPassword && confirmNewPassword) e.currentTarget.style.background = '#C9A84C' }}>
            {changingPassword ? (<><Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />Cambiando...</>) : (<><Key style={{ width: '1rem', height: '1rem' }} />Cambiar Contraseña</>)}
          </button>
        </form>
      </div>

      {/* Session / Danger Zone */}
      <div className="p-4 sm:p-6" style={{ ...cardStyle, borderColor: 'rgba(239,68,68,.1)' }}>
        {sectionHeader(<LogOut style={{ width: '1.25rem', height: '1.25rem', color: '#f87171' }} />, 'Sesión', 'Cierra tu sesión actual')}

        <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full sm:w-auto" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', height: '2.5rem', padding: '0 1.25rem', background: 'transparent', color: 'rgba(248,113,113,.7)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 0, cursor: 'pointer', transition: 'all .2s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)'; e.currentTarget.style.background = 'rgba(239,68,68,.05)'; e.currentTarget.style.color = '#f87171' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.2)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,.7)' }}>
          <LogOut style={{ width: '1rem', height: '1rem' }} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
