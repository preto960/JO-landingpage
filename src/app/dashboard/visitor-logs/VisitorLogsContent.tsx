'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Eye, Trash2, Search, Filter, Globe, Monitor, Smartphone, Tablet,
  ChevronLeft, ChevronRight, Download, AlertTriangle, X, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

type VisitorLog = {
  id: string
  ipAddress: string
  country: string | null
  city: string | null
  region: string | null
  browser: string | null
  os: string | null
  device: string | null
  page: string
  referer: string | null
  userAgent: string | null
  createdAt: string
}

type Props = {
  user: { name: string; email: string; role?: string; permissions?: string[] }
}

const DEVICE_ICONS: Record<string, any> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
}

export default function VisitorLogsContent({ user }: Props) {
  const [logs, setLogs] = useState<VisitorLog[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [countries, setCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterDevice, setFilterDevice] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteBeforeDate, setDeleteBeforeDate] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      })
      if (search) params.set('search', search)
      if (filterCountry) params.set('country', filterCountry)
      if (filterDevice) params.set('device', filterDevice)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const res = await fetch(`/api/visitors/logs?${params}`)
      if (!res.ok) throw new Error('Error al cargar logs')
      const data = await res.json()
      setLogs(data.logs)
      setTotal(data.total)
      setPages(data.pages)
      setCountries(data.countries || [])
    } catch (err: any) {
      setError(err.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, search, filterCountry, filterDevice, dateFrom, dateTo])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleClearFilters = () => {
    setSearch('')
    setFilterCountry('')
    setFilterDevice('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const handleDeleteLogs = async () => {
    setDeleting(true)
    try {
      const params = deleteBeforeDate ? `?beforeDate=${deleteBeforeDate}` : ''
      const res = await fetch(`/api/visitors/logs${params}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')
      const data = await res.json()
      setDeleteDialogOpen(false)
      setDeleteBeforeDate('')
      fetchLogs()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Fecha', 'IP', 'Pais', 'Ciudad', 'Region', 'Navegador', 'SO', 'Dispositivo', 'Pagina', 'Referer']
    const rows = logs.map(l => [
      new Date(l.createdAt).toLocaleString('es-VE'),
      l.ipAddress,
      l.country || '-',
      l.city || '-',
      l.region || '-',
      l.browser || '-',
      l.os || '-',
      l.device || '-',
      l.page,
      l.referer || '-',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `visitor-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasFilters = search || filterCountry || filterDevice || dateFrom || dateTo

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-light tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}
          >
            Visitor Logs
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)', letterSpacing: '.03em' }}
          >
            Registro de visitas a tu landing page — {total.toLocaleString()} registros totales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: 'rgba(245,240,232,.5)',
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.06)',
              letterSpacing: '.05em',
              textTransform: 'uppercase',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors"
            style={{
              fontFamily: "'Jost', sans-serif",
              color: '#f87171',
              background: 'rgba(248,113,113,.05)',
              border: '1px solid rgba(248,113,113,.1)',
              letterSpacing: '.05em',
              textTransform: 'uppercase',
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        className="p-4 rounded-sm space-y-3"
        style={{
          background: 'rgba(245,240,232,.02)',
          border: '1px solid rgba(245,240,232,.06)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-3.5 h-3.5" style={{ color: 'rgba(245,240,232,.3)' }} />
          <span
            className="text-[10px] uppercase"
            style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.1em' }}
          >
            Filtros
          </span>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="ml-auto flex items-center gap-1 text-[10px] uppercase"
              style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.08em' }}
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(245,240,232,.2)' }} />
            <input
              type="text"
              placeholder="Buscar IP, pais, navegador..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-sm outline-none"
              style={{
                fontFamily: "'Jost', sans-serif",
                background: 'rgba(245,240,232,.03)',
                border: '1px solid rgba(245,240,232,.08)',
                color: '#F5F0E8',
              }}
            />
          </div>
          <select
            value={filterCountry}
            onChange={(e) => { setFilterCountry(e.target.value); setPage(1) }}
            className="px-3 py-2 text-xs rounded-sm outline-none"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.08)',
              color: '#F5F0E8',
            }}
          >
            <option value="">Todos los paises</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filterDevice}
            onChange={(e) => { setFilterDevice(e.target.value); setPage(1) }}
            className="px-3 py-2 text-xs rounded-sm outline-none"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.08)',
              color: '#F5F0E8',
            }}
          >
            <option value="">Todos los dispositivos</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 text-xs rounded-sm outline-none"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.08)',
              color: '#F5F0E8',
              colorScheme: 'dark',
            }}
            placeholder="Desde"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-2 text-xs rounded-sm outline-none"
            style={{
              fontFamily: "'Jost', sans-serif",
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.08)',
              color: '#F5F0E8',
              colorScheme: 'dark',
            }}
            placeholder="Hasta"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-sm"
          style={{ background: 'rgba(248,113,113,.05)', border: '1px solid rgba(248,113,113,.1)' }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: '#f87171' }} />
          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: '#f87171' }}>{error}</span>
          <button onClick={fetchLogs} className="ml-auto" style={{ color: '#f87171' }}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-sm overflow-hidden"
        style={{
          background: 'rgba(245,240,232,.02)',
          border: '1px solid rgba(245,240,232,.06)',
        }}
      >
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(245,240,232,.06)' }}>
                {['Fecha', 'IP', 'Ubicacion', 'Dispositivo', 'Navegador', 'Pagina', 'Referer'].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[10px] uppercase"
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      color: 'rgba(245,240,232,.3)',
                      letterSpacing: '.1em',
                      fontWeight: 400,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'rgba(245,240,232,.3)' }} />
                      <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>
                        Cargando...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Eye className="w-8 h-8 mx-auto mb-2" style={{ color: 'rgba(245,240,232,.1)' }} />
                    <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
                      No hay registros de visitas
                    </span>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => {
                  const DeviceIcon = DEVICE_ICONS[log.device || 'Desktop'] || Monitor
                  return (
                    <tr
                      key={log.id}
                      className="transition-colors"
                      style={{
                        borderBottom: '1px solid rgba(245,240,232,.03)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(245,240,232,.01)',
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                          {formatDate(log.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="text-xs px-1.5 py-0.5 rounded-sm"
                          style={{
                            fontFamily: "monospace",
                            color: 'rgba(245,240,232,.4)',
                            background: 'rgba(245,240,232,.03)',
                          }}
                        >
                          {log.ipAddress}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {log.country && (
                            <Globe className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(201,168,76,.6)' }} />
                          )}
                          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                            {[log.city, log.region, log.country].filter(Boolean).join(', ') || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <DeviceIcon className="w-3 h-3" style={{ color: 'rgba(245,240,232,.3)' }} />
                          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                            {log.os || '-'}
                          </span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-sm ml-1"
                            style={{
                              fontFamily: "'Jost', sans-serif",
                              color: 'rgba(245,240,232,.25)',
                              background: 'rgba(245,240,232,.03)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {log.device || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                          {log.browser || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code
                          className="text-xs px-1.5 py-0.5 rounded-sm"
                          style={{
                            fontFamily: "'Jost', sans-serif",
                            color: 'rgba(245,240,232,.4)',
                            background: 'rgba(245,240,232,.03)',
                          }}
                        >
                          {log.page}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs block max-w-[200px] truncate"
                          style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}
                          title={log.referer || ''}
                        >
                          {log.referer ? (
                            new URL(log.referer).hostname
                          ) : (
                            <span style={{ color: 'rgba(245,240,232,.15)' }}>Directo</span>
                          )}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y" style={{ borderColor: 'rgba(245,240,232,.04)' }}>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12">
              <RefreshCw className="w-4 h-4 animate-spin" style={{ color: 'rgba(245,240,232,.3)' }} />
              <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>
                Cargando...
              </span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Eye className="w-8 h-8 mb-2" style={{ color: 'rgba(245,240,232,.1)' }} />
              <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.2)' }}>
                No hay registros
              </span>
            </div>
          ) : (
            logs.map(log => {
              const DeviceIcon = DEVICE_ICONS[log.device || 'Desktop'] || Monitor
              return (
                <div key={log.id} className="p-4 space-y-2" style={{ borderBottom: '1px solid rgba(245,240,232,.04)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="w-3.5 h-3.5" style={{ color: 'rgba(245,240,232,.4)' }} />
                      <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.5)' }}>
                        {log.browser} — {log.os}
                      </span>
                    </div>
                    <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.25)' }}>
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code
                      className="text-[10px] px-1.5 py-0.5 rounded-sm"
                      style={{
                        fontFamily: "monospace",
                        color: 'rgba(245,240,232,.35)',
                        background: 'rgba(245,240,232,.03)',
                      }}
                    >
                      {log.ipAddress}
                    </code>
                    {log.country && (
                      <span className="text-[10px]" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)' }}>
                        {[log.city, log.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-sm transition-colors disabled:opacity-30"
            style={{
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.06)',
              color: 'rgba(245,240,232,.5)',
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs" style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)' }}>
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-sm transition-colors disabled:opacity-30"
            style={{
              background: 'rgba(245,240,232,.03)',
              border: '1px solid rgba(245,240,232,.06)',
              color: 'rgba(245,240,232,.5)',
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{ background: '#1C1C1C', border: '1px solid rgba(245,240,232,.07)' }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Cormorant Garamond', serif", color: '#F5F0E8' }}>
              Eliminar registros
            </DialogTitle>
            <DialogDescription style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.4)' }}>
              {deleteBeforeDate
                ? 'Se eliminaran todos los registros anteriores a la fecha seleccionada.'
                : 'Se eliminaran TODOS los registros de visitas. Esta accion no se puede deshacer.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="space-y-2">
              <label
                className="text-[10px] uppercase"
                style={{ fontFamily: "'Jost', sans-serif", color: 'rgba(245,240,232,.3)', letterSpacing: '.1em' }}
              >
                Eliminar anteriores a (opcional — dejar vacio para eliminar todo)
              </label>
              <input
                type="date"
                value={deleteBeforeDate}
                onChange={(e) => setDeleteBeforeDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-sm outline-none"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  background: 'rgba(245,240,232,.03)',
                  border: '1px solid rgba(245,240,232,.08)',
                  color: '#F5F0E8',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 text-xs rounded-sm"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: 'rgba(245,240,232,.5)',
                background: 'rgba(245,240,232,.03)',
                border: '1px solid rgba(245,240,232,.08)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteLogs}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-sm"
              style={{
                fontFamily: "'Jost', sans-serif",
                color: '#fff',
                background: 'rgba(248,113,113,.15)',
                border: '1px solid rgba(248,113,113,.2)',
                letterSpacing: '.05em',
                textTransform: 'uppercase',
              }}
            >
              {deleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
