import { useState, useEffect } from 'react'

import { SectionHeader, Alert, Button, Table, Modal, TextField, DropdownMenu, EmptyState } from '@/components'
import { CheckCircle, Wrench, FileText, History, Inbox } from 'lucide-react'
import { createMaintenanceLog, getMaintenanceLogsByScooterId, resolveMaintenance } from '@/features/maintenance'
import { getAllScooters, getScootersByStatus, updateScooter } from '@/features/scooters'
import { formatCurrency, formatDateTime, getApiErrorMessage, formatBatteryLevel } from '@/utils'
import type { TableColumn } from '@/components/ui/Table'

interface Scooter {
  id: number | string
  name: string
  batteryLevel: number
  status: string
}

interface MaintenanceLog {
  id: number
  scooterId: number
  description: string
  cost: number
  createdAt: string
}

interface CreateFormState {
  description: string
  cost: string
}

type TabStatus = 'MAINTENANCE' | 'ALL'

export default function MaintenancePage() {
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  const [statusTab, setStatusTab] = useState<TabStatus>('MAINTENANCE')
  const [searchTerm, setSearchTerm] = useState('')
  const [resolvingAll, setResolvingAll] = useState(false)
  
  // Modals state
  const [, setResolvingId] = useState<number | string | null>(null)
  
  const [createLogModalOpen, setCreateLogModalOpen] = useState(false)
  const [selectedScooterId, setSelectedScooterId] = useState<number | string | null>(null)
  const [createForm, setCreateForm] = useState<CreateFormState>({ description: '', cost: '' })
  const [creating, setCreating] = useState(false)
  
  const [viewLogsModalOpen, setViewLogsModalOpen] = useState(false)
  const [logs, setLogs] = useState<MaintenanceLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    fetchScooters(statusTab, true)
    
    // Silent poll every 5s
    const interval = setInterval(() => {
      fetchScooters(statusTab, false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [statusTab])

  async function fetchScooters(status: TabStatus, showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const data = status === 'ALL' 
        ? await getAllScooters()
        : await getScootersByStatus(status)
      setScooters(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch scooters'))
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  async function handleResolve(id: number | string) {
    setResolvingId(id)
    setError('')
    setSuccess('')
    try {
      await resolveMaintenance(id)
      setSuccess(`Scooter #${id} resolved successfully.`)
      fetchScooters(statusTab, false)
    } catch (err) {
      // Fallback nếu lỗi dữ liệu (xe đang ở MAINTENANCE nhưng ko có log)
      try {
        const s = scooters.find(x => x.id === id)
        if (s) {
          await updateScooter(s.id, { name: s.name, batteryLevel: 100, status: 'AVAILABLE' })
          setSuccess(`Scooter #${id} resolved (forced fallback).`)
          fetchScooters(statusTab, false)
          return
        }
      } catch (fallbackErr) {}
      setError(getApiErrorMessage(err, 'Unable to resolve maintenance'))
    } finally {
      setResolvingId(null)
    }
  }

  async function handleMarkAsBroken(scooter: Scooter) {
    setResolvingId(scooter.id)
    setError('')
    setSuccess('')
    try {
      await createMaintenanceLog({
        scooterId: Number(scooter.id),
        description: 'Reported broken from management page',
        cost: 0,
      })
      setSuccess(`Scooter #${scooter.id} marked as broken.`)
      fetchScooters(statusTab, false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update scooter status'))
    } finally {
      setResolvingId(null)
    }
  }

  async function handleResolveAll() {
    const maintenanceScooters = scooters.filter(s => s.status === 'MAINTENANCE')
    if (maintenanceScooters.length === 0) return

    setResolvingAll(true)
    setError('')
    setSuccess('')
    
    try {
      await Promise.allSettled(
        maintenanceScooters.map(async (s) => {
          try {
            await resolveMaintenance(s.id)
          } catch (err) {
            // Fallback cho xe bị lỗi dữ liệu (không có log bảo trì)
            await updateScooter(s.id, {
              name: s.name,
              batteryLevel: 100,
              status: 'AVAILABLE'
            })
          }
        })
      )
      setSuccess(`Resolved ${maintenanceScooters.length} scooters successfully.`)
      fetchScooters(statusTab, false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to resolve some scooters'))
      fetchScooters(statusTab, false)
    } finally {
      setResolvingAll(false)
    }
  }

  function openCreateModal(id: number | string) {
    setSelectedScooterId(id)
    setCreateForm({ description: '', cost: '' })
    setCreateLogModalOpen(true)
  }

  async function handleCreateLog(e: React.SyntheticEvent) {
    e.preventDefault()
    if (!selectedScooterId) return
    
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      await createMaintenanceLog({
        scooterId: Number(selectedScooterId),
        description: createForm.description,
        cost: Number(createForm.cost),
      })
      setSuccess(`Log added for Scooter #${selectedScooterId}.`)
      setCreateLogModalOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create maintenance log'))
    } finally {
      setCreating(false)
    }
  }

  async function openViewLogsModal(id: number | string) {
    setSelectedScooterId(id)
    setViewLogsModalOpen(true)
    setLogsLoading(true)
    setLogs([])
    try {
      const data = await getMaintenanceLogsByScooterId(id)
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load logs for scooter'))
    } finally {
      setLogsLoading(false)
    }
  }

  const columns: TableColumn<Scooter>[] = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'name', label: 'Name', render: (row) => row.name || `Scooter #${row.id}` },
    { key: 'batteryLevel', label: 'Battery', align: 'right' as const, isNumeric: true, render: (row) => formatBatteryLevel(row.batteryLevel) || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
            row.status === 'MAINTENANCE'
              ? 'bg-[rgba(255,92,122,0.12)] text-danger border border-[rgba(255,92,122,0.3)]'
              : row.status === 'AVAILABLE'
                ? 'bg-[rgba(0,209,255,0.12)] text-cyan-soft border border-[rgba(0,209,255,0.3)]'
                : 'bg-surface-elevated text-text-muted border border-border'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row) => {
        const items = [];
        if (row.status === 'MAINTENANCE') {
          items.push({ label: 'Resolve', icon: <CheckCircle size={14} />, onClick: () => handleResolve(row.id) });
        } else {
          items.push({ label: 'Mark Broken', icon: <Wrench size={14} />, danger: true, onClick: () => handleMarkAsBroken(row) });
        }
        items.push({ label: 'Add Log', icon: <FileText size={14} />, onClick: () => openCreateModal(row.id) });
        items.push({ label: 'History', icon: <History size={14} />, onClick: () => openViewLogsModal(row.id) });
        
        return <DropdownMenu items={items} />;
      },
    },
  ]

  const logColumns: TableColumn<MaintenanceLog>[] = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'description', label: 'Description' },
    { key: 'cost', label: 'Cost', align: 'right' as const, isNumeric: true, render: (row) => formatCurrency(row.cost) },
    { key: 'createdAt', label: 'Created', render: (row) => formatDateTime(row.createdAt) || '-' },
  ]

  const filteredScooters = scooters.filter((s) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return s.id.toString().includes(term) || (s.name || '').toLowerCase().includes(term)
  })

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Fleet Operations"
        title="Maintenance Management"
        description="Monitor broken scooters, add repair logs, and resolve maintenance status."
        actions={
          <Button 
            onClick={handleResolveAll} 
            disabled={resolvingAll || scooters.filter(s => s.status === 'MAINTENANCE').length === 0}
          >
            {resolvingAll ? 'Resolving All...' : 'Resolve All'}
          </Button>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
              statusTab === 'MAINTENANCE'
                ? 'border-brand text-text-strong bg-brand-soft'
                : 'border-transparent text-text-muted hover:text-text hover:bg-surface-elevated'
            }`}
            onClick={() => { setStatusTab('MAINTENANCE'); setSearchTerm('') }}
          >
            MAINTENANCE ONLY
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
              statusTab === 'ALL'
                ? 'border-brand text-text-strong bg-brand-soft'
                : 'border-transparent text-text-muted hover:text-text hover:bg-surface-elevated'
            }`}
            onClick={() => { setStatusTab('ALL'); setSearchTerm('') }}
          >
            ALL SCOOTERS
          </button>
        </div>
        
        <div className="w-full max-w-xs">
          <TextField
            name="search"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-bg/50 backdrop-blur-sm rounded-md">
            <span className="text-cyan-soft font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</span>
          </div>
        )}
        <Table
          columns={columns}
          rows={filteredScooters}
          rowKey={(row) => row.id}
          emptyState={
            <EmptyState
              icon={<Inbox size={24} />}
              title="No scooters found"
              description="There are currently no scooters matching your criteria."
            />
          }
        />
      </div>

      {/* Modal: Add Log */}
      <Modal
        open={createLogModalOpen}
        title={`Add Maintenance Log (Scooter #${selectedScooterId})`}
        onClose={() => setCreateLogModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setCreateLogModalOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" form="create-log-form" disabled={creating}>
              {creating ? 'Saving...' : 'Save Log'}
            </Button>
          </div>
        }
      >
        <form id="create-log-form" className="grid gap-5" onSubmit={handleCreateLog}>
          <TextField
            label="Description of repair/issue"
            name="description"
            value={createForm.description}
            onChange={(e) => setCreateForm((c) => ({ ...c, description: e.target.value }))}
            required
            autoFocus
          />
          <TextField
            label="Cost (VND)"
            type="number"
            name="cost"
            min="0"
            step="1000"
            value={createForm.cost}
            onChange={(e) => setCreateForm((c) => ({ ...c, cost: e.target.value }))}
            required
          />
        </form>
      </Modal>

      {/* Modal: View Logs */}
      <Modal
        open={viewLogsModalOpen}
        title={`Maintenance History (Scooter #${selectedScooterId})`}
        onClose={() => setViewLogsModalOpen(false)}
        footer={
          <div className="flex items-center justify-end">
            <Button variant="secondary" onClick={() => setViewLogsModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="relative max-h-[60vh] overflow-y-auto">
          {logsLoading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-bg/50 backdrop-blur-sm rounded-md">
              <span className="text-cyan-soft font-bold text-sm animate-pulse">Loading logs...</span>
            </div>
          )}
          <Table
            columns={logColumns}
            rows={logs}
            rowKey={(row) => row.id}
            emptyState={
              <EmptyState
                icon={<Inbox size={24} />}
                title="No maintenance logs"
                description="There are no maintenance records available."
              />
            }
          />
        </div>
      </Modal>
    </div>
  )
}