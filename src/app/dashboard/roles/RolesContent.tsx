'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Shield, ShieldCheck, Plus, Trash2, Save, Loader2,
  Check, X, Users as UsersIcon, ChevronDown, ChevronRight,
  Edit3, AlertTriangle,
} from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'

type Permission = {
  id: string; name: string; label: string; module: string; description?: string | null
}

type RoleWithPerms = {
  id: string; name: string; label: string; description?: string | null
  userCount: number; permissions: string[]; createdAt: string
}

type GroupedPerms = Record<string, Permission[]>

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuarios',
  products: 'Productos',
  orders: 'Pedidos',
  settings: 'Perfil',
  audit: 'Auditoría',
  roles: 'Roles',
}

const MODULE_COLORS: Record<string, string> = {
  dashboard: '#60a5fa',
  users: '#C9A84C',
  products: '#22c55e',
  orders: '#fb923c',
  settings: '#a78bfa',
  audit: 'rgba(245,240,232,.5)',
  roles: '#f87171',
}

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

export default function RolesContent({ user }: { user: { name: string; email: string; role: string; permissions: string[] } }) {
  const { can } = usePermissions()

  // ─── Data state ──────────────────────────────────────
  const [roles, setRoles] = useState<RoleWithPerms[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [grouped, setGrouped] = useState<GroupedPerms>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  // ─── Create role state ───────────────────────────────
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createLabel, setCreateLabel] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createError, setCreateError] = useState('')

  // ─── Edit role state ─────────────────────────────────
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editDesc, setEditDesc] = useState('')

  // ─── Expanded role for permissions ───────────────────
  const [expandedRole, setExpandedRole] = useState<string | null>(null)
  const [localPermissions, setLocalPermissions] = useState<string[]>([])

  // ─── Delete confirmation ─────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // ─── Fetch ───────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/roles')
      const data = await res.json()
      setRoles(data.roles)
      setAllPermissions(data.permissions)
      setGrouped(data.grouped)
    } catch {
      console.error('Error al cargar roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  // ─── Create role ─────────────────────────────────────
  const handleCreateRole = async () => {
    setCreateError('')
    if (!createName.trim() || !createLabel.trim()) {
      setCreateError('El nombre interno y la etiqueta son obligatorios.')
      return
    }
    if (!/^[a-z_]+$/.test(createName.trim())) {
      setCreateError('El nombre interno solo puede contener minúsculas y guiones bajos (ej: mi_rol).')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName.trim(),
          label: createLabel.trim(),
          description: createDesc.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setCreateName(''); setCreateLabel(''); setCreateDesc('')
        setShowCreateForm(false)
        fetchRoles()
      } else {
        setCreateError(data.error || 'Error al crear el rol.')
      }
    } catch {
      setCreateError('Error de conexión.')
    } finally {
      setCreating(false)
    }
  }

  // ─── Edit role info ──────────────────────────────────
  const startEditRole = (role: RoleWithPerms) => {
    setEditingRole(role.id)
    setEditLabel(role.label)
    setEditDesc(role.description || '')
  }

  const handleSaveEdit = async (roleId: string) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: editLabel, description: editDesc || null }),
      })
      if (res.ok) {
        setEditingRole(null)
        fetchRoles()
      }
    } catch {}
  }

  // ─── Delete role ─────────────────────────────────────
  const handleDeleteRole = async (roleId: string) => {
    try {
      const res = await fetch(`/api/roles/${roleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setDeleteConfirm(null)
        if (expandedRole === roleId) setExpandedRole(null)
        fetchRoles()
      } else {
        alert(data.error || 'Error al eliminar el rol.')
      }
    } catch {}
  }

  // ─── Toggle permission for a role ────────────────────
  const togglePermission = (permName: string) => {
    setLocalPermissions(prev =>
      prev.includes(permName)
        ? prev.filter(p => p !== permName)
        : [...prev, permName]
    )
  }

  // ─── Toggle all permissions in a module ──────────────
  const toggleModule = (moduleName: string) => {
    const modulePerms = grouped[moduleName] || []
    const moduleNames = modulePerms.map(p => p.name)
    const allSelected = moduleNames.every(n => localPermissions.includes(n))

    if (allSelected) {
      setLocalPermissions(prev => prev.filter(p => !moduleNames.includes(p)))
    } else {
      setLocalPermissions(prev => {
        const existing = new Set(prev)
        moduleNames.forEach(n => existing.add(n))
        return Array.from(existing)
      })
    }
  }

  // ─── Save permissions ────────────────────────────────
  const handleSavePermissions = async (roleId: string) => {
    setSaving(roleId)
    try {
      const res = await fetch(`/api/roles/${roleId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: localPermissions }),
      })
      if (res.ok) {
        fetchRoles()
      }
    } catch {} finally {
      setSaving(null)
    }
  }

  // ─── Expand role ─────────────────────────────────────
  const expandRole = (role: RoleWithPerms) => {
    if (expandedRole === role.id) {
      setExpandedRole(null)
    } else {
      setExpandedRole(role.id)
      setLocalPermissions([...role.permissions])
    }
  }

  // ─── Computed ────────────────────────────────────────
  const getRoleColor = (name: string) => ROLE_COLORS[name] || 'rgba(245,240,232,.5)'
  const isSystemRole = (name: string) => ['super_admin', 'admin', 'editor', 'viewer'].includes(name)

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '64rem' }}>
      {/* ─── Header ───────────────────────────────────── */}
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
          Roles y <span style={{ color: '#C9A84C' }}>Permisos</span>
        </h1>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '.85rem',
            color: 'rgba(245,240,232,.4)',
            marginTop: '.5rem',
          }}
        >
          Configura los roles del sistema y los permisos asignados a cada uno
        </p>
      </div>

      {/* ─── Gold divider ─────────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)',
        }}
      />

      {/* ─── Stats ─────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Roles', value: roles.length, icon: Shield, color: '#C9A84C' },
            { label: 'Permisos', value: allPermissions.length, icon: ShieldCheck, color: '#22c55e' },
            { label: 'Módulos', value: Object.keys(grouped).length, icon: ChevronRight, color: '#60a5fa' },
            { label: 'Usuarios', value: roles.reduce((sum, r) => sum + r.userCount, 0), icon: UsersIcon, color: '#fb923c' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="p-4"
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '.75rem',
              }}
            >
              <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
                style={{
                  border: `1px solid ${color}22`,
                  background: `${color}0a`,
                }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '1.25rem',
                    fontWeight: 300,
                    color: '#F5F0E8',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </p>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    color: 'rgba(245,240,232,.3)',
                    margin: '0.25rem 0 0',
                  }}
                >
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Create Role ──────────────────────────────── */}
      <PermissionGate permission="roles.manage">
        <div className="p-4 sm:p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center"
                style={{
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
                  Crear Rol
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
                  Nuevo rol personalizado
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setCreateName(''); setCreateLabel(''); setCreateDesc(''); setCreateError('')
                setShowCreateForm(!showCreateForm)
              }}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500,
                letterSpacing: '.18em', textTransform: 'uppercase',
                height: '2.5rem', padding: '0 1.25rem',
                background: showCreateForm ? 'transparent' : '#C9A84C',
                color: showCreateForm ? 'rgba(245,240,232,.5)' : '#0A0A0A',
                border: showCreateForm ? '1px solid rgba(245,240,232,.12)' : 'none',
                cursor: 'pointer', transition: 'all .3s',
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              }}
            >
              {showCreateForm ? 'Cancelar' : 'Nuevo Rol'}
            </button>
          </div>

          {showCreateForm && (
            <div className="p-4 mt-4" style={{ background: 'rgba(10,10,10,.4)', border: '1px solid rgba(245,240,232,.06)' }}>
              {createError && (
                <div className="mb-4 p-3" style={{ background: 'rgba(248,113,113,.06)', border: '1px solid rgba(248,113,113,.15)' }}>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: '#f87171' }}>{createError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>
                    Nombre interno (solo minúsculas)
                  </label>
                  <input
                    type="text" placeholder="ej: gerente_ventas"
                    value={createName} onChange={(e) => setCreateName(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
                    style={inputBase}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  />
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>
                    Etiqueta visible
                  </label>
                  <input
                    type="text" placeholder="ej: Gerente de Ventas"
                    value={createLabel} onChange={(e) => setCreateLabel(e.target.value)}
                    style={inputBase}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>
                  Descripción (opcional)
                </label>
                <input
                  type="text" placeholder="Descripción breve del rol..."
                  value={createDesc} onChange={(e) => setCreateDesc(e.target.value)}
                  style={inputBase}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                />
              </div>
              <button
                onClick={handleCreateRole} disabled={creating}
                style={{
                  fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500,
                  letterSpacing: '.18em', textTransform: 'uppercase',
                  height: '2.5rem', padding: '0 1.5rem',
                  background: creating ? 'rgba(201,168,76,.4)' : '#C9A84C',
                  color: '#0A0A0A', border: 'none',
                  cursor: creating ? 'not-allowed' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                }}
              >
                {creating ? (
                  <><Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} /> Creando...</>
                ) : 'Crear Rol'}
              </button>
            </div>
          )}
        </div>
      </PermissionGate>

      {/* ─── Roles List ───────────────────────────────── */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 flex items-center justify-center" style={{ border: '1px solid rgba(201,168,76,.15)', background: 'rgba(201,168,76,.05)' }}>
            <Shield className="w-5 h-5" style={{ color: '#C9A84C' }} />
          </div>
          <div>
            <h2 className="text-base sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>
              Roles del sistema ({roles.length})
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)' }}>
              Haz clic en un rol para ver y editar sus permisos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#C9A84C' }} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {roles.map((role) => {
              const isExpanded = expandedRole === role.id
              const isEditing = editingRole === role.id
              const isSaving = saving === role.id
              const roleColor = getRoleColor(role.name)

              return (
                <div
                  key={role.id}
                  style={{
                    border: isExpanded ? `1px solid ${roleColor}33` : '1px solid rgba(245,240,232,.06)',
                    background: isExpanded ? `${roleColor}06` : 'transparent',
                    transition: 'all .2s ease',
                  }}
                >
                  {/* ─── Role header row ─────────────────── */}
                  <div
                    className="flex items-center gap-3 p-3 sm:p-4 cursor-pointer"
                    onClick={() => expandRole(role)}
                    style={{ minHeight: '3.5rem' }}
                    onMouseEnter={(e) => { if (!isExpanded) { e.currentTarget.style.background = 'rgba(245,240,232,.02)' } }}
                    onMouseLeave={(e) => { if (!isExpanded) { e.currentTarget.style.background = 'transparent' } }}
                  >
                    {/* Expand arrow */}
                    <div style={{ color: 'rgba(245,240,232,.2)', transition: 'transform .2s', transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    {/* Role info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '.875rem',
                            color: '#F5F0E8',
                            fontWeight: 400,
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                ...inputBase,
                                width: '12rem',
                                height: '2rem',
                                fontSize: '.875rem',
                                padding: '0 .5rem',
                              }}
                            />
                          ) : (
                            role.label
                          )}
                        </span>
                        <span
                          className="px-2 py-0.5"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            fontSize: '.55rem',
                            textTransform: 'uppercase',
                            letterSpacing: '.1em',
                            color: roleColor,
                            background: `${roleColor}0d`,
                            border: `1px solid ${roleColor}1a`,
                          }}
                        >
                          {role.name}
                        </span>
                        {isSystemRole(role.name) && (
                          <span
                            className="px-1.5 py-0.5"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: '.5rem',
                              textTransform: 'uppercase',
                              letterSpacing: '.08em',
                              color: 'rgba(245,240,232,.2)',
                              background: 'rgba(245,240,232,.03)',
                            }}
                          >
                            Sistema
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: 'rgba(245,240,232,.3)' }}>
                          <UsersIcon className="w-3 h-3 inline mr-1" style={{ verticalAlign: 'middle' }} />
                          {role.userCount} usuario{role.userCount !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: 'rgba(245,240,232,.3)' }}>
                          <ShieldCheck className="w-3 h-3 inline mr-1" style={{ verticalAlign: 'middle' }} />
                          {role.permissions.length} permiso{role.permissions.length !== 1 ? 's' : ''}
                        </span>
                        {role.description && (
                          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', color: 'rgba(245,240,232,.2)' }}>
                            — {role.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <PermissionGate permission="roles.manage">
                        {!isSystemRole(role.name) && (
                          <>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(role.id)}
                                  className="p-1.5"
                                  style={{ background: 'none', border: 'none', color: 'rgba(34,197,94,.6)', cursor: 'pointer' }}
                                  title="Guardar"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingRole(null)}
                                  className="p-1.5"
                                  style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,.5)', cursor: 'pointer' }}
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditRole(role)}
                                  className="p-1.5"
                                  style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,.25)', cursor: 'pointer' }}
                                  title="Editar nombre"
                                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.5)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,240,232,.25)')}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                {deleteConfirm === role.id ? (
                                  <div className="flex items-center gap-1">
                                    <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', color: '#f87171', whiteSpace: 'nowrap' }}>¿Eliminar?</span>
                                    <button
                                      onClick={() => handleDeleteRole(role.id)}
                                      className="p-1"
                                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="p-1"
                                      style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,.3)', cursor: 'pointer' }}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(role.id)}
                                    disabled={role.userCount > 0}
                                    className="p-1.5"
                                    style={{
                                      background: 'none', border: 'none',
                                      color: role.userCount > 0 ? 'rgba(245,240,232,.08)' : 'rgba(248,113,113,.25)',
                                      cursor: role.userCount > 0 ? 'not-allowed' : 'pointer',
                                    }}
                                    title={role.userCount > 0 ? 'No se puede eliminar: tiene usuarios' : 'Eliminar rol'}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </PermissionGate>
                    </div>
                  </div>

                  {/* ─── Permissions panel ──────────────── */}
                  {isExpanded && (
                    <div
                      className="px-3 sm:px-4 pb-4"
                      style={{ borderTop: '1px solid rgba(245,240,232,.04)' }}
                    >
                      {deleteConfirm === role.id && role.userCount > 0 && (
                        <div
                          className="flex items-center gap-2 p-3 mb-4"
                          style={{
                            background: 'rgba(251,191,36,.06)',
                            border: '1px solid rgba(251,191,36,.15)',
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#fbbf24' }} />
                          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.8rem', color: '#fbbf24' }}>
                            No se puede eliminar este rol porque tiene {role.userCount} usuario(s) asignado(s). Reasigna los usuarios primero.
                          </p>
                        </div>
                      )}

                      {/* Module groups */}
                      <div className="flex flex-col gap-3 mt-4">
                        {Object.entries(grouped).map(([moduleName, perms]) => {
                          const modulePerms = perms.map(p => p.name)
                          const selectedCount = modulePerms.filter(n => localPermissions.includes(n)).length
                          const allSelected = selectedCount === modulePerms.length
                          const moduleColor = MODULE_COLORS[moduleName] || 'rgba(245,240,232,.5)'

                          return (
                            <div
                              key={moduleName}
                              style={{
                                border: '1px solid rgba(245,240,232,.04)',
                                background: 'rgba(10,10,10,.2)',
                              }}
                            >
                              {/* Module header */}
                              <div
                                className="flex items-center gap-3 p-3"
                                style={{ borderBottom: '1px solid rgba(245,240,232,.04)' }}
                              >
                                <button
                                  onClick={() => toggleModule(moduleName)}
                                  className="flex items-center gap-3 flex-1 min-w-0"
                                  style={{
                                    background: 'none', border: 'none',
                                    cursor: can('roles.manage') ? 'pointer' : 'default',
                                    padding: 0, textAlign: 'left',
                                  }}
                                  disabled={!can('roles.manage')}
                                >
                                  {/* Checkbox */}
                                  <div
                                    style={{
                                      width: '1rem', height: '1rem',
                                      border: allSelected
                                        ? `2px solid ${moduleColor}`
                                        : '1px solid rgba(245,240,232,.15)',
                                      background: allSelected ? moduleColor : 'transparent',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      transition: 'all .15s',
                                    }}
                                  >
                                    {allSelected && <Check style={{ width: '.7rem', height: '.7rem', color: '#0A0A0A', strokeWidth: 3 }} />}
                                  </div>
                                  <span
                                    style={{
                                      fontFamily: "'Jost', sans-serif",
                                      fontSize: '.75rem',
                                      fontWeight: 500,
                                      textTransform: 'uppercase',
                                      letterSpacing: '.1em',
                                      color: moduleColor,
                                    }}
                                  >
                                    {MODULE_LABELS[moduleName] || moduleName}
                                  </span>
                                  <span style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', color: 'rgba(245,240,232,.25)' }}>
                                    {selectedCount}/{modulePerms.length}
                                  </span>
                                </button>
                              </div>

                              {/* Individual permissions */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                                {perms.map((perm) => {
                                  const isChecked = localPermissions.includes(perm.name)

                                  return (
                                    <label
                                      key={perm.id}
                                      className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer"
                                      style={{
                                        borderBottom: '1px solid rgba(245,240,232,.02)',
                                        background: isChecked ? `${moduleColor}08` : 'transparent',
                                        opacity: can('roles.manage') ? 1 : 0.6,
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isChecked && can('roles.manage')) {
                                          e.currentTarget.style.background = 'rgba(245,240,232,.02)'
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = isChecked ? `${moduleColor}08` : 'transparent'
                                      }}
                                    >
                                      {/* Checkbox */}
                                      <div
                                        style={{
                                          width: '.875rem', height: '.875rem', flexShrink: 0,
                                          border: isChecked
                                            ? `1.5px solid ${moduleColor}`
                                            : '1px solid rgba(245,240,232,.12)',
                                          background: isChecked ? moduleColor : 'transparent',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          transition: 'all .15s',
                                        }}
                                      >
                                        {isChecked && <Check style={{ width: '.6rem', height: '.6rem', color: '#0A0A0A', strokeWidth: 3 }} />}
                                      </div>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => togglePermission(perm.name)}
                                        disabled={!can('roles.manage')}
                                        className="sr-only"
                                      />
                                      <div className="min-w-0">
                                        <span
                                          style={{
                                            fontFamily: "'Jost', sans-serif",
                                            fontSize: '.78rem',
                                            color: isChecked ? '#F5F0E8' : 'rgba(245,240,232,.45)',
                                            transition: 'color .15s',
                                          }}
                                        >
                                          {perm.label}
                                        </span>
                                        {perm.description && (
                                          <p
                                            style={{
                                              fontFamily: "'Jost', sans-serif",
                                              fontSize: '.6rem',
                                              color: 'rgba(245,240,232,.2)',
                                              margin: '0.1rem 0 0',
                                            }}
                                          >
                                            {perm.description}
                                          </p>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Save button */}
                      <PermissionGate permission="roles.manage">
                        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(245,240,232,.06)' }}>
                          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.75rem', color: 'rgba(245,240,232,.3)' }}>
                            {localPermissions.length} de {allPermissions.length} permisos seleccionados
                          </p>
                          <button
                            onClick={() => handleSavePermissions(role.id)}
                            disabled={isSaving}
                            style={{
                              fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500,
                              letterSpacing: '.18em', textTransform: 'uppercase',
                              height: '2.5rem', padding: '0 1.5rem',
                              background: isSaving ? 'rgba(201,168,76,.4)' : '#C9A84C',
                              color: '#0A0A0A', border: 'none',
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                              transition: 'background .3s',
                            }}
                          >
                            {isSaving ? (
                              <><Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} /> Guardando...</>
                            ) : (
                              <><Save style={{ width: '.875rem', height: '.875rem' }} /> Guardar Permisos</>
                            )}
                          </button>
                        </div>
                      </PermissionGate>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
