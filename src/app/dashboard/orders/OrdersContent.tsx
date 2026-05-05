'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Plus, Pencil, Trash2, ShoppingCart, Package } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type OrderItem = {
  id: string
  productId: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
  product: { id: string; name: string; price: number } | null
}

type ProductItem = {
  id: string
  name: string
  price: number
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#fb923c',
  en_proceso: '#60a5fa',
  completado: '#22c55e',
  cancelado: '#f87171',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(28,28,28,.3)',
  border: '1px solid rgba(245,240,232,.06)',
}

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

const labelStyle: React.CSSProperties = {
  fontFamily: "'Jost', sans-serif",
  fontSize: '.7rem',
  fontWeight: 400,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,232,.55)',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OrdersContent({
  user,
}: {
  user: { name: string; email: string; role: string; permissions: string[] }
}) {
  const { can } = usePermissions()

  /* ---- Data state ---- */
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  /* ---- Products for dropdown ---- */
  const [products, setProducts] = useState<ProductItem[]>([])

  /* ---- Form state ---- */
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formProductId, setFormProductId] = useState('')
  const [formCustomerName, setFormCustomerName] = useState('')
  const [formCustomerEmail, setFormCustomerEmail] = useState('')
  const [formCustomerPhone, setFormCustomerPhone] = useState('')
  const [formStatus, setFormStatus] = useState('pendiente')
  const [formNotes, setFormNotes] = useState('')

  const limit = 20

  /* ================================================================ */
  /*  Fetch helpers                                                    */
  /* ================================================================ */

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/orders?${params}`)
      const data = await res.json()
      setOrders(data.orders)
      setTotalOrders(data.pagination?.total ?? data.orders.length)
    } catch {
      console.error('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      console.error('Error al cargar productos')
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  /* ================================================================ */
  /*  Form helpers                                                     */
  /* ================================================================ */

  const resetForm = () => {
    setEditingId(null)
    setFormProductId('')
    setFormCustomerName('')
    setFormCustomerEmail('')
    setFormCustomerPhone('')
    setFormStatus('pendiente')
    setFormNotes('')
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (order: OrderItem) => {
    setEditingId(order.id)
    setFormProductId(order.productId)
    setFormCustomerName(order.customerName)
    setFormCustomerEmail(order.customerEmail)
    setFormCustomerPhone(order.customerPhone || '')
    setFormStatus(order.status)
    setFormNotes(order.notes || '')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  /* ================================================================ */
  /*  CRUD handlers                                                    */
  /* ================================================================ */

  const handleSubmit = async () => {
    if (!formProductId || !formCustomerName || !formCustomerEmail) return

    const body: Record<string, unknown> = {
      productId: formProductId,
      customerName: formCustomerName,
      customerEmail: formCustomerEmail,
      customerPhone: formCustomerPhone || null,
      status: formStatus,
      notes: formNotes || null,
    }

    setActionLoading(editingId ?? 'new')
    try {
      const url = editingId ? `/api/orders/${editingId}` : '/api/orders'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        closeForm()
        fetchOrders()
      }
    } catch {
      console.error('Error al guardar pedido')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string, customerName: string) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el pedido de ${customerName}? Esta acción es irreversible.`
      )
    )
      return

    setActionLoading(id)
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      if (res.ok) fetchOrders()
    } catch {
      console.error('Error al eliminar pedido')
    } finally {
      setActionLoading(null)
    }
  }

  /* ================================================================ */
  /*  Derived                                                          */
  /* ================================================================ */

  const totalPages = Math.ceil(totalOrders / limit)
  const isSubmitting = actionLoading !== null

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '60rem' }}>
      {/* ---- Header ---- */}
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
          Gestión de <span style={{ color: '#C9A84C' }}>Pedidos</span>
        </h1>
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '.85rem',
            color: 'rgba(245,240,232,.4)',
            marginTop: '.5rem',
          }}
        >
          Administra los pedidos de los clientes
        </p>
      </div>

      {/* ---- Gold divider ---- */}
      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)',
        }}
      />

      {/* ============================================================ */}
      {/*  Create / Edit Form                                           */}
      {/* ============================================================ */}
      {showForm && (
        <div className="p-4 sm:p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 mb-5">
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
                {editingId ? (
                  <Pencil className="w-5 h-5" style={{ color: '#C9A84C' }} />
                ) : (
                  <Plus className="w-5 h-5" style={{ color: '#C9A84C' }} />
                )}
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
                  {editingId ? 'Editar Pedido' : 'Nuevo Pedido'}
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
                  {editingId ? 'Modificar datos del pedido' : 'Registrar nueva solicitud'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Product */}
            <div>
              <label className="block mb-2" style={labelStyle}>
                Producto
              </label>
              <select
                value={formProductId}
                onChange={(e) => setFormProductId(e.target.value)}
                style={{
                  ...inputBase,
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">Seleccionar producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ${p.price.toLocaleString('es-MX')}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block mb-2" style={labelStyle}>
                Estado
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                style={{
                  ...inputBase,
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block mb-2" style={labelStyle}>
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={formCustomerName}
                onChange={(e) => setFormCustomerName(e.target.value)}
                placeholder="Nombre completo"
                style={inputBase}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')
                }
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="block mb-2" style={labelStyle}>
                Email del Cliente
              </label>
              <input
                type="email"
                value={formCustomerEmail}
                onChange={(e) => setFormCustomerEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={inputBase}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')
                }
              />
            </div>

            {/* Customer Phone */}
            <div>
              <label className="block mb-2" style={labelStyle}>
                Teléfono <span style={{ color: 'rgba(245,240,232,.25)' }}>(opcional)</span>
              </label>
              <input
                type="tel"
                value={formCustomerPhone}
                onChange={(e) => setFormCustomerPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                style={inputBase}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')
                }
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block mb-2" style={labelStyle}>
                Notas <span style={{ color: 'rgba(245,240,232,.25)' }}>(opcional)</span>
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Observaciones adicionales sobre el pedido..."
                rows={3}
                style={{
                  ...inputBase,
                  height: 'auto',
                  minHeight: '4rem',
                  resize: 'vertical',
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')
                }
              />
            </div>
          </div>

          {/* Form actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formProductId || !formCustomerName || !formCustomerEmail}
              className="text-center"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.78rem',
                fontWeight: 500,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                height: '2.5rem',
                padding: '0 1.5rem',
                background:
                  isSubmitting || !formProductId || !formCustomerName || !formCustomerEmail
                    ? 'rgba(201,168,76,.3)'
                    : '#C9A84C',
                color: '#0A0A0A',
                border: 'none',
                cursor:
                  isSubmitting || !formProductId || !formCustomerName || !formCustomerEmail
                    ? 'not-allowed'
                    : 'pointer',
                transition: 'background .3s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
              }}
            >
              {isSubmitting ? (
                <Loader2
                  style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }}
                />
              ) : null}
              {editingId ? 'Guardar Cambios' : 'Crear Pedido'}
            </button>

            <button
              onClick={closeForm}
              disabled={isSubmitting}
              className="text-center"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.78rem',
                fontWeight: 500,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                height: '2.5rem',
                padding: '0 1.5rem',
                background: 'transparent',
                color: 'rgba(245,240,232,.5)',
                border: '1px solid rgba(245,240,232,.12)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all .3s',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Orders List                                                  */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-6" style={cardStyle}>
        {/* Section header */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
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
              {orders.length > 0 ? (
                <ShoppingCart className="w-5 h-5" style={{ color: '#C9A84C' }} />
              ) : (
                <Package className="w-5 h-5" style={{ color: '#C9A84C' }} />
              )}
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
                Pedidos ({totalOrders})
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

          <PermissionGate permission="orders.create">
            {!showForm && (
              <button
                onClick={openCreateForm}
                className="w-full sm:w-auto text-center"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: '.78rem',
                  fontWeight: 500,
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  height: '2.5rem',
                  padding: '0 1.25rem',
                  background: '#C9A84C',
                  color: '#0A0A0A',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.5rem',
                }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                Nuevo Pedido
              </button>
            )}
          </PermissionGate>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4 flex-col sm:flex-row">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'rgba(245,240,232,.25)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o producto..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full"
              style={{ ...inputBase, paddingLeft: '2.5rem' }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')
              }
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
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
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* ---- Table ---- */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2
              className="w-5 h-5 animate-spin"
              style={{ color: '#C9A84C' }}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Package
              style={{ width: '2rem', height: '2rem', color: 'rgba(245,240,232,.15)' }}
            />
            <p
              className="text-center"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.85rem',
                color: 'rgba(245,240,232,.3)',
              }}
            >
              No se encontraron pedidos
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Desktop header */}
            <div
              className="hidden md:grid md:grid-cols-12 gap-3 pb-3 mb-2"
              style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}
            >
              {[
                { text: 'ID', col: 'col-span-2' },
                { text: 'Producto', col: 'col-span-2' },
                { text: 'Cliente', col: 'col-span-2' },
                { text: 'Email', col: 'col-span-2' },
                { text: 'Estado', col: 'col-span-1' },
                { text: 'Fecha', col: 'col-span-1' },
                { text: 'Acciones', col: 'col-span-2 text-right' },
              ].map((h) => (
                <span
                  key={h.text}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: '.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    color: 'rgba(245,240,232,.25)',
                  }}
                  className={h.col}
                >
                  {h.text}
                </span>
              ))}
            </div>

            {/* Rows */}
            {orders.map((order) => {
              const isBusy = actionLoading === order.id
              const statusColor = STATUS_COLORS[order.status] || 'rgba(245,240,232,.5)'
              const statusLabel =
                STATUS_LABELS[order.status] || order.status

              return (
                <div
                  key={order.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center py-3"
                  style={{ borderBottom: '1px solid rgba(245,240,232,.04)' }}
                >
                  {/* ID */}
                  <div className="md:col-span-2">
                    <span
                      className="text-xs font-mono block md:inline-block"
                      style={{
                        fontFamily: 'monospace',
                        color: 'rgba(245,240,232,.35)',
                        letterSpacing: '.05em',
                      }}
                    >
                      {order.id.length > 8
                        ? `${order.id.slice(0, 8)}...`
                        : order.id}
                    </span>
                  </div>

                  {/* Product */}
                  <div className="md:col-span-2">
                    <span
                      className="text-sm block md:inline-block truncate"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.7)',
                      }}
                    >
                      {order.product?.name || 'Producto eliminado'}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="md:col-span-2">
                    <span
                      className="text-sm block md:inline-block truncate"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.7)',
                      }}
                    >
                      {order.customerName}
                    </span>
                  </div>

                  {/* Customer Email */}
                  <div className="md:col-span-2">
                    <span
                      className="text-xs block md:inline-block truncate"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.35)',
                      }}
                    >
                      {order.customerEmail}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="md:col-span-1">
                    <span
                      className="inline-block px-2 py-0.5"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: '.6rem',
                        fontWeight: 400,
                        textTransform: 'uppercase',
                        letterSpacing: '.08em',
                        color: statusColor,
                        background: `${statusColor}10`,
                        border: `1px solid ${statusColor}25`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-1">
                    <span
                      className="text-xs block md:inline-block"
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        color: 'rgba(245,240,232,.25)',
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString('es', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex gap-2 justify-end mt-1 md:mt-0">
                    <PermissionGate permission="orders.edit">
                      <button
                        onClick={() => openEditForm(order)}
                        disabled={isBusy}
                        className="p-1.5"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(201,168,76,.5)',
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          opacity: isBusy ? 0.3 : 1,
                        }}
                        title="Editar pedido"
                      >
                        {isBusy ? (
                          <Loader2
                            style={{
                              width: '.875rem',
                              height: '.875rem',
                              animation: 'spin 1s linear infinite',
                            }}
                          />
                        ) : (
                          <Pencil style={{ width: '.875rem', height: '.875rem' }} />
                        )}
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="orders.delete">
                      <button
                        onClick={() => handleDelete(order.id, order.customerName)}
                        disabled={isBusy}
                        className="p-1.5"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(248,113,113,.3)',
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          opacity: isBusy ? 0.3 : 1,
                        }}
                        title="Eliminar pedido"
                      >
                        <Trash2 style={{ width: '.875rem', height: '.875rem' }} />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ---- Pagination ---- */}
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
                  color:
                    page === 1
                      ? 'rgba(245,240,232,.15)'
                      : 'rgba(245,240,232,.4)',
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
                  color:
                    page === totalPages
                      ? 'rgba(245,240,232,.15)'
                      : 'rgba(245,240,232,.4)',
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
