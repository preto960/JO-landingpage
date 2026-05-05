'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Shield, Users, UserCheck, UserX, Trash2, Plus, Check, X } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'

type UserItem = {
  id: string; name: string; email: string
  role: { name: string; label: string }
  image?: string | null; isActive: boolean; lastLogin: string | null; createdAt: string
  _count: { auditLogs: number }
}

type RoleItem = { id: string; name: string; label: string }

const cardStyle: React.CSSProperties = {
  background: 'rgba(28,28,28,.3)',
  border: '1px solid rgba(245,240,232,.06)',
}

const inputBase: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif", fontSize: '.85rem', fontWeight: 300, lineHeight: '1.5',
  width: '100%', height: '2.75rem', padding: '0 .875rem',
  background: 'rgba(10,10,10,.6)', border: '1px solid rgba(245,240,232,.07)',
  borderRadius: 0, color: '#F5F0E8', caretColor: '#C9A84C', outline: 'none',
  transition: 'border-color .3s ease', boxSizing: 'border-box',
}

export default function UsersContent({ user }: { user: { name: string; email: string; role: string; permissions: string[] } }) {
  const { can } = usePermissions()

  // ─── Users list state ────────────────────────────────────
  const [users, setUsers] = useState<UserItem[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ─── Create user state ───────────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createRoleId, setCreateRoleId] = useState('')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // ─── Roles ───────────────────────────────────────────────
  const [roles, setRoles] = useState<RoleItem[]>([])

  const limit = 10

  // ─── Fetch users ─────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      setUsers(data.users)
      setTotalUsers(data.pagination.total)
    } catch {
      console.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ─── Fetch roles ─────────────────────────────────────────
  useEffect(() => {
    setRoles([
      { id: 'role_viewer', name: 'viewer', label: 'Observador' },
      { id: 'role_editor', name: 'editor', label: 'Editor' },
      { id: 'role_admin', name: 'admin', label: 'Administrador' },
      { id: 'role_super_admin', name: 'super_admin', label: 'Super Administrador' },
    ])
    setCreateRoleId('role_viewer')
  }, [])

  // ─── Create user ─────────────────────────────────────────
  const handleCreateUser = async () => {
    setCreateError('')
    setCreateSuccess('')

    if (!createName.trim() || !createEmail.trim() || !createPassword.trim() || !createRoleId) {
      setCreateError('Todos los campos son obligatorios.')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          roleId: createRoleId,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setCreateSuccess(`Usuario "${data.user.name}" creado correctamente.`)
        setCreateName('')
        setCreateEmail('')
        setCreatePassword('')
        setCreateRoleId(roles.length > 0 ? roles[0].id : '')
        setShowCreateForm(false)
        setPage(1)
        fetchUsers()
      } else {
        setCreateError(data.error || 'Error al crear el usuario.')
      }
    } catch {
      setCreateError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setCreating(false)
    }
  }

  const clearCreateForm = () => {
    setCreateName('')
    setCreateEmail('')
    setCreatePassword('')
    setCreateRoleId(roles.length > 0 ? roles[0].id : '')
    setCreateError('')
    setCreateSuccess('')
  }

  // ─── Change role ─────────────────────────────────────────
  const handleChangeRole = async (userId: string, newRoleId: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  // ─── Toggle active ───────────────────────────────────────
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}/activate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  // ─── Delete user ─────────────────────────────────────────
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción es irreversible.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  // ─── Computed ────────────────────────────────────────────
  const totalPages = Math.ceil(totalUsers / limit)
  const getRoleLabel = (name: string) => ROLE_LABELS[name] || name
  const getRoleColor = (name: string) => ROLE_COLORS[name] || 'rgba(245,240,232,.5)'

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '56rem' }}>
      {/* ─── Header ──────────────────────────────────────── */}
      <div>
        <h1
          className="text-[1.5rem] sm:text-[1.875rem]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            color: '#F5F0E8',
            margin: 0,
          }}
        >
          Gestión de <span style={{ color: '#C9A84C' }}>Usuarios</span>
        </h1>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '.85rem',
            color: 'rgba(245,240,232,.4)',
            marginTop: '.5rem',
          }}
        >
          Administra los usuarios y permisos del sistema
        </p>
      </div>

      {/* ─── Gold divider ────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)',
        }}
      />

      {/* ─── Success banner ──────────────────────────────── */}
      {createSuccess && (
        <div
          className="flex items-center justify-between gap-3 p-4"
          style={{
            background: 'rgba(34,197,94,.06)',
            border: '1px solid rgba(34,197,94,.15)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Check style={{ width: '1rem', height: '1rem', color: '#22c55e', flexShrink: 0 }} />
            <p
              className="text-sm truncate"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: '#22c55e',
              }}
            >
              {createSuccess}
            </p>
          </div>
          <button
            onClick={() => setCreateSuccess('')}
            className="p-1 flex-shrink-0"
            style={{ background: 'none', border: 'none', color: 'rgba(34,197,94,.5)', cursor: 'pointer' }}
          >
            <X style={{ width: '.875rem', height: '.875rem' }} />
          </button>
        </div>
      )}

      {/* ─── Create User Form ────────────────────────────── */}
      <PermissionGate permission="users.create">
        <div className="p-4 sm:p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(201,168,76,.15)',
                  background: 'rgba(201,168,76,.05)',
                }}
              >
                <Plus className="w-5 h-5" style={{ color: '#C9A84C' }} />
              </div>
              <div>
                <h2
                  className="text-base sm:text-[1.125rem]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    color: '#F5F0E8',
                    margin: 0,
                  }}
                >
                  Crear Usuario
                </h2>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    color: 'rgba(245,240,232,.25)',
                  }}
                >
                  Nuevo acceso al sistema
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (showCreateForm) clearCreateForm()
                setShowCreateForm(!showCreateForm)
              }}
              className="w-full sm:w-auto text-center"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.78rem',
                fontWeight: 500,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                height: '2.5rem',
                padding: '0 1.25rem',
                background: showCreateForm ? 'transparent' : '#C9A84C',
                color: showCreateForm ? 'rgba(245,240,232,.5)' : '#0A0A0A',
                border: showCreateForm ? '1px solid rgba(245,240,232,.12)' : 'none',
                cursor: 'pointer',
                transition: 'all .3s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
              }}
            >
              {showCreateForm ? 'Cancelar' : 'Nuevo Usuario'}
            </button>
          </div>

          {showCreateForm && (
            <div
              className="p-4"
              style={{
                background: 'rgba(10,10,10,.4)',
                border: '1px solid rgba(245,240,232,.06)',
              }}
            >
              {/* Error message */}
              {createError && (
                <div
                  className="mb-4 p-3"
                  style={{
                    background: 'rgba(248,113,113,.06)',
                    border: '1px solid rgba(248,113,113,.15)',
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: '#f87171',
                    }}
                  >
                    {createError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '.7rem',
                      fontWeight: 400,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,.55)',
                    }}
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    placeholder="Nombre del usuario"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '.7rem',
                      fontWeight: 400,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,.55)',
                    }}
                  >
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '.7rem',
                      fontWeight: 400,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,.55)',
                    }}
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Contraseña segura"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  />
                </div>

                {/* Role */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: '.7rem',
                      fontWeight: 400,
                      letterSpacing: '.12em',
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,.55)',
                    }}
                  >
                    Rol asignado
                  </label>
                  <select
                    value={createRoleId}
                    onChange={(e) => setCreateRoleId(e.target.value)}
                    style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="w-full sm:w-auto text-center"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '.78rem',
                  fontWeight: 500,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  height: '2.5rem',
                  padding: '0 1.5rem',
                  background: creating ? 'rgba(201,168,76,.4)' : '#C9A84C',
                  color: '#0A0A0A',
                  border: 'none',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  transition: 'background .3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.5rem',
                }}
              >
                {creating ? (
                  <>
                    <Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} />
                    Creando...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </button>
            </div>
          )}
        </div>
      </PermissionGate>

      {/* ─── Users List ───────────────────────────────────── */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(201,168,76,.15)',
              background: 'rgba(201,168,76,.05)',
            }}
          >
            <Users className="w-5 h-5" style={{ color: '#C9A84C' }} />
          </div>
          <div>
            <h2
              className="text-base sm:text-[1.125rem]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                color: '#F5F0E8',
                margin: 0,
              }}
            >
              Usuarios ({totalUsers})
            </h2>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.7rem',
                textTransform: 'uppercase',
                letterSpacing: '.1em',
                color: 'rgba(245,240,232,.25)',
              }}
            >
              Lista completa
            </p>
          </div>
        </div>

        {/* ─── Search & Filter ────────────────────────────── */}
        <div className="flex gap-3 mb-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgba(245,240,232,.25)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full"
              style={{ ...inputBase, paddingLeft: '2.5rem' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            style={{
              ...inputBase,
              width: 'auto',
              minWidth: '10rem',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Todos los roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* ─── Table / List ──────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#C9A84C' }} />
          </div>
        ) : users.length === 0 ? (
          <p
            className="text-center py-12"
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '.85rem',
              color: 'rgba(245,240,232,.3)',
            }}
          >
            No se encontraron usuarios
          </p>
        ) : (
          <div className="flex flex-col">
            {/* Table header (desktop) */}
            <div
              className="hidden sm:grid sm:grid-cols-12 gap-3 pb-3 mb-2"
              style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}
            >
              {['Usuario', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    color: 'rgba(245,240,232,.25)',
                  }}
                  className={
                    h === 'Usuario'
                      ? 'col-span-4'
                      : h === 'Acciones'
                        ? 'col-span-3 text-right'
                        : 'col-span-2'
                  }
                >
                  {h}
                </span>
              ))}
            </div>

            {/* User rows */}
            {users.map((u) => {
              const isSelf = u.id === user.id
              const isBusy = actionLoading === u.id
              const roleName = u.role?.name || 'viewer'

              return (
                <div
                  key={u.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center py-3"
                  style={{ borderBottom: '1px solid rgba(245,240,232,.04)' }}
                >
                  {/* User name & email */}
                  <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: 'rgba(201,168,76,.08)',
                        border: '1px solid rgba(201,168,76,.12)',
                      }}
                    >
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          color: '#C9A84C',
                          fontWeight: 300,
                        }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm truncate"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color: 'rgba(245,240,232,.7)',
                        }}
                      >
                        {u.name}{' '}
                        {isSelf && (
                          <span
                            className="text-xs"
                            style={{ color: 'rgba(245,240,232,.25)' }}
                          >
                            (Tú)
                          </span>
                        )}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          color: 'rgba(245,240,232,.3)',
                        }}
                      >
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Role badge / changer */}
                  <div className="sm:col-span-2">
                    <PermissionGate
                      permission="users.edit_role"
                      fallback={
                        <span
                          className="inline-block px-2 py-0.5"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '.6rem',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                            color: getRoleColor(roleName),
                            background: 'rgba(201,168,76,.05)',
                            border: '1px solid rgba(201,168,76,.1)',
                          }}
                        >
                          {u.role?.label || getRoleLabel(roleName)}
                        </span>
                      }
                    >
                      {!isSelf ? (
                        <select
                          value={u.role?.name || 'viewer'}
                          onChange={(e) =>
                            handleChangeRole(
                              u.id,
                              roles.find((r) => r.name === e.target.value)?.id || '',
                            )
                          }
                          disabled={isBusy}
                          className="w-full"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '.7rem',
                            fontWeight: 400,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            padding: '.375rem .5rem',
                            background: 'rgba(10,10,10,.6)',
                            border: '1px solid rgba(245,240,232,.07)',
                            borderRadius: 0,
                            color: getRoleColor(roleName),
                            appearance: 'none',
                            cursor: 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                          }}
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.name}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className="inline-block px-2 py-0.5"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '.6rem',
                            textTransform: 'uppercase',
                            letterSpacing: '.08em',
                            color: getRoleColor(roleName),
                            background: 'rgba(201,168,76,.05)',
                            border: '1px solid rgba(201,168,76,.1)',
                          }}
                        >
                          {u.role?.label || getRoleLabel(roleName)}
                        </span>
                      )}
                    </PermissionGate>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '.65rem',
                        color: u.isActive ? 'rgba(34,197,94,.7)' : 'rgba(248,113,113,.7)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5"
                        style={{
                          background: u.isActive ? '#22c55e' : '#f87171',
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Last login */}
                  <div className="sm:col-span-2">
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.25)',
                      }}
                    >
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('es') : 'Nunca'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="sm:col-span-3 flex gap-2 justify-end items-center">
                    {!isSelf && (
                      <PermissionGate permission="users.activate">
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          disabled={isBusy}
                          className="p-1.5"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: u.isActive ? 'rgba(248,113,113,.4)' : 'rgba(34,197,94,.5)',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy ? 0.5 : 1,
                          }}
                          title={u.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {isBusy ? (
                            <Loader2
                              style={{
                                width: '.875rem',
                                height: '.875rem',
                                animation: 'spin 1s linear infinite',
                              }}
                            />
                          ) : u.isActive ? (
                            <UserX style={{ width: '.875rem', height: '.875rem' }} />
                          ) : (
                            <UserCheck style={{ width: '.875rem', height: '.875rem' }} />
                          )}
                        </button>
                      </PermissionGate>
                    )}
                    <PermissionGate permission="users.delete">
                      {!isSelf && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={isBusy}
                          className="p-1.5"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(248,113,113,.3)',
                            cursor: isBusy ? 'not-allowed' : 'pointer',
                            opacity: isBusy ? 0.3 : 1,
                          }}
                          title="Eliminar usuario"
                        >
                          <Trash2 style={{ width: '.875rem', height: '.875rem' }} />
                        </button>
                      )}
                    </PermissionGate>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Pagination ──────────────────────────────────── */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between gap-4 mt-4 pt-4"
            style={{ borderTop: '1px solid rgba(245,240,232,.06)' }}
          >
            <span
              className="text-xs"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: 'rgba(245,240,232,.25)',
              }}
            >
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '.7rem',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  padding: '.5rem 1rem',
                  background: 'transparent',
                  color: page === 1 ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)',
                  border: '1px solid rgba(245,240,232,.08)',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '.7rem',
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  padding: '.5rem 1rem',
                  background: 'transparent',
                  color: page === totalPages ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)',
                  border: '1px solid rgba(245,240,232,.08)',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
