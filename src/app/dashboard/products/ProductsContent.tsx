'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Search, Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Package, DollarSign } from 'lucide-react'
import { PermissionGate } from '@/components/rbac/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: { orders: number }
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

const textareaBase: React.CSSProperties = {
  ...inputBase,
  height: 'auto',
  minHeight: '5rem',
  padding: '.75rem .875rem',
  resize: 'vertical',
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function ProductsContent({ user }: { user: { name: string; email: string; role: string; permissions: string[] } }) {
  const { can } = usePermissions()

  // List state
  const [products, setProducts] = useState<Product[]>([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formFeatures, setFormFeatures] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const limit = 20

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotalProducts(data.pagination?.total || 0)
    } catch {
      console.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const resetForm = () => {
    setEditingId(null)
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormFeatures('')
    setFormError('')
    setFormSubmitting(false)
  }

  const openCreateForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setFormName(product.name)
    setFormDescription(product.description || '')
    setFormPrice(String(product.price))
    setFormFeatures(product.features.join(', '))
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!formName.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    if (!formPrice || isNaN(Number(formPrice)) || Number(formPrice) < 0) {
      setFormError('El precio debe ser un número válido')
      return
    }

    setFormSubmitting(true)
    setFormError('')

    const features = formFeatures
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0)

    const payload = {
      name: formName.trim(),
      description: formDescription.trim() || null,
      price: Number(formPrice),
      features,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!res.ok) {
        const err = await res.json()
        setFormError(err.error || err.message || 'Error al guardar')
        return
      }

      closeForm()
      fetchProducts()
    } catch {
      setFormError('Error de conexión')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    setActionLoading(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      if (res.ok) fetchProducts()
    } catch {
      console.error('Error al cambiar estado')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Estás seguro de eliminar "${product.name}"? Esta acción es irreversible.`)) return
    setActionLoading(product.id)
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      if (res.ok) fetchProducts()
    } catch {
      console.error('Error al eliminar')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(totalProducts / limit)

  return (
    <div className="flex flex-col gap-5 sm:gap-8" style={{ maxWidth: '56rem' }}>
      {/* ─── Header ─── */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1
            className="text-[1.5rem] sm:text-[1.875rem]"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}
          >
            Gestión de <span style={{ color: '#C9A84C' }}>Sistemas</span>
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.85rem', color: 'rgba(245,240,232,.4)', marginTop: '.5rem' }}>
            Administra los sistemas y paquetes disponibles
          </p>
        </div>
        <PermissionGate permission="products.create">
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
              background: showForm && !editingId ? 'transparent' : '#C9A84C',
              color: showForm && !editingId ? 'rgba(245,240,232,.5)' : '#0A0A0A',
              border: showForm && !editingId ? '1px solid rgba(245,240,232,.12)' : 'none',
              cursor: 'pointer',
              transition: 'all .3s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '.5rem',
            }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            Nuevo Sistema
          </button>
        </PermissionGate>
      </div>

      {/* ─── Gold Divider ─── */}
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(to right, rgba(201,168,76,.3), transparent)' }} />

      {/* ─── Create / Edit Form ─── */}
      {showForm && (
        <div className="p-4 sm:p-6" style={cardStyle}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,.15)', background: 'rgba(201,168,76,.05)' }}
              >
                <Package className="w-5 h-5" style={{ color: '#C9A84C' }} />
              </div>
              <div>
                <h2
                  className="text-base sm:text-[1.125rem]"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: '#F5F0E8', margin: 0 }}
                >
                  {editingId ? 'Editar Sistema' : 'Nuevo Sistema'}
                </h2>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(245,240,232,.25)' }}>
                  {editingId ? 'Modifica los datos del sistema' : 'Completa los datos para crear un sistema'}
                </p>
              </div>
            </div>
            <button
              onClick={closeForm}
              className="p-2"
              style={{ background: 'none', border: '1px solid rgba(245,240,232,.1)', color: 'rgba(245,240,232,.4)', cursor: 'pointer' }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label
                className="block mb-2"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}
              >
                Nombre del sistema *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Sitio Web Corporativo"
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                className="block mb-2"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}
              >
                Descripción
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe brevemente este sistema..."
                style={textareaBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
              />
            </div>

            {/* Price */}
            <div>
              <label
                className="block mb-2"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}
              >
                Precio (COP)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'rgba(201,168,76,.5)' }}
                />
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  style={{ ...inputBase, paddingLeft: '2.5rem' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label
                className="block mb-2"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: '.7rem', fontWeight: 400, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.55)' }}
              >
                Características (separadas por coma)
              </label>
              <input
                type="text"
                value={formFeatures}
                onChange={(e) => setFormFeatures(e.target.value)}
                placeholder="SEO, Responsive, Hosting, SSL..."
                style={inputBase}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(245,240,232,.07)')}
              />
            </div>
          </div>

          {/* Form Error */}
          {formError && (
            <p className="mb-4 text-sm" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(248,113,113,.8)' }}>
              {formError}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeForm}
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
                cursor: 'pointer',
                transition: 'all .3s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={formSubmitting}
              className="text-center"
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '.78rem',
                fontWeight: 500,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                height: '2.5rem',
                padding: '0 1.5rem',
                background: formSubmitting ? 'rgba(201,168,76,.5)' : '#C9A84C',
                color: '#0A0A0A',
                border: 'none',
                cursor: formSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background .3s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '.5rem',
              }}
            >
              {formSubmitting ? (
                <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Check style={{ width: '1rem', height: '1rem' }} />
              )}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* ─── Search ─── */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'rgba(245,240,232,.25)' }}
        />
        <input
          type="text"
          placeholder="Buscar sistemas por nombre o descripción..."
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

      {/* ─── Products List ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#C9A84C' }} />
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.8rem', color: 'rgba(245,240,232,.3)' }}>Cargando sistemas...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div
            className="w-14 h-14"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245,240,232,.06)', background: 'rgba(245,240,232,.01)' }}
          >
            <Package className="w-6 h-6" style={{ color: 'rgba(245,240,232,.15)' }} />
          </div>
          <div className="text-center">
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: 'rgba(245,240,232,.35)', fontWeight: 300 }}>
              {search ? 'No se encontraron resultados' : 'No hay sistemas registrados'}
            </p>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.78rem', color: 'rgba(245,240,232,.2)', marginTop: '.35rem' }}>
              {search ? 'Intenta con otro término de búsqueda' : 'Crea el primer sistema para comenzar'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Count */}
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '.78rem', color: 'rgba(245,240,232,.3)' }}>
              {totalProducts} sistema{totalProducts !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Product Cards */}
          {products.map((product) => {
            const isBusy = actionLoading === product.id

            return (
              <div
                key={product.id}
                className="p-4 sm:p-5 transition-all duration-300"
                style={{
                  ...cardStyle,
                  opacity: isBusy ? 0.5 : product.isActive ? 1 : 0.55,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left — Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-base sm:text-lg truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#F5F0E8', margin: 0 }}
                      >
                        {product.name}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 flex-shrink-0"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '.6rem',
                          fontWeight: 400,
                          letterSpacing: '.08em',
                          textTransform: 'uppercase',
                          color: product.isActive ? 'rgba(34,197,94,.7)' : 'rgba(248,113,113,.7)',
                          background: product.isActive ? 'rgba(34,197,94,.06)' : 'rgba(248,113,113,.06)',
                          border: `1px solid ${product.isActive ? 'rgba(34,197,94,.15)' : 'rgba(248,113,113,.15)'}`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5"
                          style={{ background: product.isActive ? '#22c55e' : '#f87171', borderRadius: '50%', display: 'inline-block' }}
                        />
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                      <p
                        className="mb-3"
                        style={{
                          fontFamily: "'Jost', sans-serif",
                          fontSize: '.8rem',
                          fontWeight: 300,
                          color: 'rgba(245,240,232,.4)',
                          lineHeight: '1.6',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </p>
                    )}

                    {/* Features Tags */}
                    {product.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {product.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              fontSize: '.65rem',
                              fontWeight: 400,
                              letterSpacing: '.04em',
                              color: 'rgba(201,168,76,.7)',
                              background: 'rgba(201,168,76,.05)',
                              border: '1px solid rgba(201,168,76,.1)',
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <span
                        className="text-sm sm:text-base"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: '#C9A84C' }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      <span style={{ color: 'rgba(245,240,232,.08)' }}>|</span>
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}
                      >
                        {product._count.orders} pedido{product._count.orders !== 1 ? 's' : ''}
                      </span>
                      <span style={{ color: 'rgba(245,240,232,.08)' }}>|</span>
                      <span
                        className="text-xs"
                        style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}
                      >
                        Creado {formatDate(product.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right — Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PermissionGate permission="products.edit">
                      <button
                        onClick={() => openEditForm(product)}
                        disabled={isBusy}
                        className="p-2"
                        style={{
                          background: 'none',
                          border: '1px solid rgba(245,240,232,.08)',
                          color: 'rgba(245,240,232,.4)',
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          transition: 'all .3s',
                        }}
                        title="Editar"
                      >
                        {isBusy ? (
                          <Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Pencil style={{ width: '.875rem', height: '.875rem' }} />
                        )}
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="products.edit">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={isBusy}
                        className="p-2"
                        style={{
                          background: 'none',
                          border: '1px solid rgba(245,240,232,.08)',
                          color: product.isActive ? 'rgba(248,113,113,.4)' : 'rgba(34,197,94,.5)',
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          transition: 'all .3s',
                        }}
                        title={product.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {isBusy ? (
                          <Loader2 style={{ width: '.875rem', height: '.875rem', animation: 'spin 1s linear infinite' }} />
                        ) : product.isActive ? (
                          <EyeOff style={{ width: '.875rem', height: '.875rem' }} />
                        ) : (
                          <Eye style={{ width: '.875rem', height: '.875rem' }} />
                        )}
                      </button>
                    </PermissionGate>

                    <PermissionGate permission="products.delete">
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={isBusy}
                        className="p-2"
                        style={{
                          background: 'none',
                          border: '1px solid rgba(245,240,232,.08)',
                          color: 'rgba(248,113,113,.3)',
                          cursor: isBusy ? 'not-allowed' : 'pointer',
                          transition: 'all .3s',
                        }}
                        title="Eliminar"
                      >
                        <Trash2 style={{ width: '.875rem', height: '.875rem' }} />
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between gap-4 mt-2 pt-4"
          style={{ borderTop: '1px solid rgba(245,240,232,.06)' }}
        >
          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
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
  )
}
