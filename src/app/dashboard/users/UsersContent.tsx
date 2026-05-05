'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Shield, Users, UserCheck, UserX, Trash2, X, Copy, Check } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac'

type UserItem = {
  id: string; name: string; email: string
  role: { name: string; label: string }
  image?: string | null; isActive: boolean; lastLogin: string | null; createdAt: string
  _count: { auditLogs: number }
}

type InviteItem = {
  id: string; code: string; role: { name: string; label: string }
  maxUses: number; usedCount: number; expiresAt: string | null; createdAt: string
  creator: { name: string; email: string }
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

  const [users, setUsers] = useState<UserItem[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [invites, setInvites] = useState<InviteItem[]>([])
  const [loadingInvites, setLoadingInvites] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteRoleId, setInviteRoleId] = useState('')
  const [inviteMaxUses, setInviteMaxUses] = useState('1')
  const [inviteExpiry, setInviteExpiry] = useState('48')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null)
  const [roles, setRoles] = useState<RoleItem[]>([])

  const limit = 10

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
    } catch { console.error('Failed to fetch users') }
    finally { setLoading(false) }
  }, [page, search, roleFilter])

  const fetchInvites = async () => {
    setLoadingInvites(true)
    try {
      const res = await fetch('/api/invites')
      const data = await res.json()
      setInvites(data.invites)
    } catch { console.error('Failed to fetch invites') }
    finally { setLoadingInvites(false) }
  }

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => { fetchInvites() }, [])

  // Fetch roles for dropdowns
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user?.role) {
        const userPerms = data.user.permissions || []
        // Fetch roles from a simple endpoint or use a fixed list
        setRoles([
          { id: 'role_viewer', name: 'viewer', label: 'Observador' },
          { id: 'role_editor', name: 'editor', label: 'Editor' },
          { id: 'role_admin', name: 'admin', label: 'Administrador' },
          { id: 'role_super_admin', name: 'super_admin', label: 'Super Administrador' },
        ])
        setInviteRoleId('role_viewer')
      }
    }).catch(() => {})
  }, [])

  const handleChangeRole = async (userId: string, newRoleId: string) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRoleId }),
      })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}/activate`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción es irreversible.`)) return
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) fetchUsers()
    } catch {} finally { setActionLoading(null) }
  }

  const handleCreateInvite = async () => {
    try {
      const res = await fetch('/api/invites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: inviteRoleId,
          maxUses: parseInt(inviteMaxUses),
          expiresInHours: parseInt(inviteExpiry),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setNewInviteCode(data.invite.code)
        setCopiedCode(data.invite.code)
        fetchInvites()
        setShowInviteForm(false)
      }
    } catch {}
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('¿Eliminar esta invitación?')) return
    try {
      const res = await fetch(`/api/invites?id=${inviteId}`, { method: 'DELETE' })
      if (res.ok) fetchInvites()
    } catch {}
  }

  const totalPages = Math.ceil(totalUsers / limit)

  const getRoleLabel = (name: string) => ROLE_LABELS[name] || name
  const getRoleColor = (name: string) => ROLE_COLORS[name] || 'rgba(245,240,232,.5)'

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '56rem' }}>
      <div>
        <h1 className="text-[1.5rem] sm:text-[1.875rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>
          Gestión de <span style={{ color: '#C9A84C' }}>Usuarios</span>
        </h1>
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.4)', marginTop: '.5rem' }}>Administra los usuarios y permisos del sistema</p>
      </div>
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }} />

      {/* New Invite Banner */}
      {newInviteCode && (
        <div className="p-4 sm:p-6" style={{ background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.15)' }}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm" style={{ fontFamily: "'Jost', sans-serif", color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.25rem' }}>Nuevo código de invitación</p>
              <p className="text-lg sm:text-xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8', letterSpacing: '.15em' }}>{newInviteCode}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopyCode(newInviteCode)} className="p-2" style={{ background: copiedCode === newInviteCode ? 'rgba(34,197,94,.1)' : 'rgba(201,168,76,.1)', border: '1px solid ' + (copiedCode === newInviteCode ? 'rgba(34,197,94,.3)' : 'rgba(201,168,76,.2)'), color: copiedCode === newInviteCode ? '#22c55e' : '#C9A84C', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {copiedCode === newInviteCode ? <Check style={{ width: '1rem', height: '1rem' }} /> : <Copy style={{ width: '1rem', height: '1rem' }} />}
              </button>
              <button onClick={() => setNewInviteCode(null)} className="p-2" style={{ background: 'none', border: '1px solid rgba(245,240,232,.1)', color: 'rgba(245,240,232,.4)', cursor: 'pointer' }}><X style={{ width: '1rem', height: '1rem' }} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Invites Section — only if user has invites.view */}
      <PermissionGate permission="invites.view">
        <div className="p-4 sm:p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,.15)', background: 'rgba(201,168,76,.05)' }}><Shield className="w-5 h-5" style={{ color: '#C9A84C' }} /></div>
              <div>
                <h2 className="text-base sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>Invitaciones</h2>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)' }}>Códigos de acceso</p>
              </div>
            </div>
            <PermissionGate permission="invites.create">
              <button onClick={() => setShowInviteForm(!showInviteForm)} className="w-full sm:w-auto text-center" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', height: '2.5rem', padding: '0 1.25rem', background: showInviteForm ? 'transparent' : '#C9A84C', color: showInviteForm ? 'rgba(245,240,232,.5)' : '#0A0A0A', border: showInviteForm ? '1px solid rgba(245,240,232,.12)' : 'none', cursor: 'pointer', transition: 'all .3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                {showInviteForm ? 'Cancelar' : 'Nueva Invitación'}
              </button>
            </PermissionGate>
          </div>

          {showInviteForm && (
            <div className="p-4 mb-4" style={{ background: 'rgba(10,10,10,.4)', border: '1px solid rgba(245,240,232,.06)' }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>Rol asignado</label>
                  <select value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)} style={{ ...inputBase, appearance: 'none', cursor: 'pointer' }}>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>Usos máximos</label>
                  <input type="number" min="1" max="100" value={inviteMaxUses} onChange={(e) => setInviteMaxUses(e.target.value)} style={inputBase} />
                </div>
                <div>
                  <label className="block mb-2" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}>Expira en (horas)</label>
                  <input type="number" min="1" max="720" value={inviteExpiry} onChange={(e) => setInviteExpiry(e.target.value)} style={inputBase} />
                </div>
              </div>
              <button onClick={handleCreateInvite} className="w-full sm:w-auto text-center" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.78rem', fontWeight: 500, letterSpacing: '.18em', textTransform: 'uppercase', height: '2.5rem', padding: '0 1.5rem', background: '#C9A84C', color: '#0A0A0A', border: 'none', cursor: 'pointer', transition: 'background .3s', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
                Generar Código
              </button>
            </div>
          )}

          {loadingInvites ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#C9A84C' }} /></div>
          ) : invites.length === 0 ? (
            <p className="text-center py-6" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.3)' }}>No hay códigos de invitación.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {invites.map((invite) => {
                const isExpired = invite.expiresAt && new Date(invite.expiresAt) < new Date()
                const isUsedUp = invite.usedCount >= invite.maxUses
                const isDisabled = isExpired || isUsedUp
                return (
                  <div key={invite.id} className="flex items-center justify-between gap-3 p-3 flex-wrap" style={{ background: isDisabled ? 'rgba(245,240,232,.01)' : 'rgba(245,240,232,.02)', border: '1px solid rgba(245,240,232,.04)', opacity: isDisabled ? 0.4 : 1 }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-mono" style={{ fontFamily: 'monospace', color: '#C9A84C', letterSpacing: '.1em' }}>{invite.code}</span>
                      <span className="hidden sm:inline-block px-2 py-0.5" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', color: getRoleColor(invite.role.name), background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.1)' }}>
                        {invite.role.label || getRoleLabel(invite.role.name)}
                      </span>
                      <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>{invite.usedCount}/{invite.maxUses}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isDisabled && (
                        <button onClick={() => handleCopyCode(invite.code)} className="p-1.5" style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,.3)', cursor: 'pointer' }}>
                          {copiedCode === invite.code ? <Check style={{ width: '.875rem', height: '.875rem', color: '#22c55e' }} /> : <Copy style={{ width: '.875rem', height: '.875rem' }} />}
                        </button>
                      )}
                      <PermissionGate permission="invites.delete">
                        <button onClick={() => handleDeleteInvite(invite.id)} className="p-1.5" style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,.4)', cursor: 'pointer' }}><Trash2 style={{ width: '.875rem', height: '.875rem' }} /></button>
                      </PermissionGate>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </PermissionGate>

      {/* Users List */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,.15)', background: 'rgba(201,168,76,.05)' }}><Users className="w-5 h-5" style={{ color: '#C9A84C' }} /></div>
          <div>
            <h2 className="text-base sm:text-[1.125rem]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}>Usuarios ({totalUsers})</h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)' }}>Lista completa</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,232,.25)' }} />
            <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full" style={{ ...inputBase, paddingLeft: '2.5rem' }} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)'} />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} style={{ ...inputBase, width: 'auto', minWidth: '10rem', appearance: 'none', cursor: 'pointer' }}>
            <option value="">Todos los roles</option>
            {roles.map(r => (<option key={r.id} value={r.name}>{r.label}</option>))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#C9A84C' }} /></div>
        ) : users.length === 0 ? (
          <p className="text-center py-12" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.3)' }}>No se encontraron usuarios</p>
        ) : (
          <div className="flex flex-col">
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 pb-3 mb-2" style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
              {['Usuario', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map((h) => (
                <span key={h} style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(245,240,232,.25)' }} className={h === 'Usuario' ? 'col-span-4' : h === 'Acciones' ? 'col-span-3 text-right' : 'col-span-2'}>{h}</span>
              ))}
            </div>

            {users.map((u) => {
              const isSelf = u.id === user.id
              const isBusy = actionLoading === u.id
              const roleName = u.role?.name || 'viewer'

              return (
                <div key={u.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center py-3" style={{ borderBottom: '1px solid rgba(245,240,232,.04)' }}>
                  <div className="sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.12)' }}>
                      <span className="text-xs" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A84C', fontWeight: 300 }}>{u.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.7)' }}>
                        {u.name} {isSelf && <span className="text-xs" style={{ color: 'rgba(245,240,232,.25)' }}>(Tú)</span>}
                      </p>
                      <p className="text-xs truncate" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>{u.email}</p>
                    </div>
                  </div>

                  {/* Role - only show changer if user has users.edit_role */}
                  <div className="sm:col-span-2">
                    <PermissionGate permission="users.edit_role" fallback={
                      <span className="inline-block px-2 py-0.5" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', color: getRoleColor(roleName), background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.1)' }}>
                        {u.role?.label || getRoleLabel(roleName)}
                      </span>
                    }>
                      {!isSelf ? (
                        <select value={u.role?.name || 'viewer'} onChange={(e) => handleChangeRole(u.id, roles.find(r => r.name === e.target.value)?.id || '')} disabled={isBusy} className="w-full" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', padding: '.375rem .5rem', background: 'rgba(10,10,10,.6)', border: '1px solid rgba(245,240,232,.07)', borderRadius: 0, color: getRoleColor(roleName), appearance: 'none', cursor: 'pointer', opacity: isBusy ? 0.5 : 1 }}>
                          {roles.map(r => (<option key={r.id} value={r.name}>{r.label}</option>))}
                        </select>
                      ) : (
                        <span className="inline-block px-2 py-0.5" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.08em', color: getRoleColor(roleName), background: 'rgba(201,168,76,.05)', border: '1px solid rgba(201,168,76,.1)' }}>
                          {u.role?.label || getRoleLabel(roleName)}
                        </span>
                      )}
                    </PermissionGate>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="inline-flex items-center gap-1" style={{ fontFamily: "'Jost', sans-serif", fontSize: '.65rem', color: u.isActive ? 'rgba(34,197,94,.7)' : 'rgba(248,113,113,.7)' }}>
                      <span className="w-1.5 h-1.5" style={{ background: u.isActive ? '#22c55e' : '#f87171', borderRadius: '50%', display: 'inline-block' }} />
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('es') : 'Nunca'}</span>
                  </div>

                  {/* Actions — each gated by its specific permission */}
                  <div className="sm:col-span-3 flex gap-2 justify-end">
                    {!isSelf && (
                      <PermissionGate permission="users.activate">
                        <button onClick={() => handleToggleActive(u.id, u.isActive)} disabled={isBusy} className="p-1.5" style={{ background: 'none', border: 'none', color: u.isActive ? 'rgba(248,113,113,.4)' : 'rgba(34,197,94,.5)', cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.5 : 1 }} title={u.isActive ? 'Desactivar' : 'Activar'}>
                          {isBusy ? <Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} /> : u.isActive ? <UserX style={{ width: '.875rem', height: '.875rem' }} /> : <UserCheck style={{ width: '.875rem', height: '.875rem' }} />}
                        </button>
                      </PermissionGate>
                    )}
                    <PermissionGate permission="users.delete">
                      {!isSelf && (
                        <button onClick={() => handleDeleteUser(u.id, u.name)} disabled={isBusy} className="p-1.5" style={{ background: 'none', border: 'none', color: 'rgba(248,113,113,.3)', cursor: isBusy ? 'not-allowed' : 'pointer', opacity: isBusy ? 0.3 : 1 }} title="Eliminar usuario">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(245,240,232,.06)' }}>
            <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.5rem 1rem', background: 'transparent', color: page === 1 ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)', border: '1px solid rgba(245,240,232,.08)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '.5rem 1rem', background: 'transparent', color: page === totalPages ? 'rgba(245,240,232,.15)' : 'rgba(245,240,232,.4)', border: '1px solid rgba(245,240,232,.08)', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
