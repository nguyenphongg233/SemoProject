import { useState, useEffect } from 'react'

import { SectionHeader, Alert, Button, Table, Modal, DropdownMenu, UserCell, EmptyState } from '@/components'
import { StopCircle, Inbox } from 'lucide-react'
import { getRentalHistory, endRental, forceEndAllRentals } from '@/features/rentals'
import { formatDateTime, formatCurrency, getApiErrorMessage } from '@/utils'
import type { TableColumn } from '@/components/ui/Table'

interface RentalResult {
  id: number | string
  userId: number | string
  userName?: string
  scooterId: number | string
  status: string
  startTime: string
  endTime: string | null
  totalPrice: number
}

type TabStatus = 'ALL' | 'IN_USE' | 'COMPLETED'

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  const [statusTab, setStatusTab] = useState<TabStatus>('ALL')
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRentalId, setSelectedRentalId] = useState<number | string | null>(null)
  const [ending, setEnding] = useState(false)
  const [isConfirmAllOpen, setIsConfirmAllOpen] = useState(false)
  const [endingAll, setEndingAll] = useState(false)

  useEffect(() => {
    fetchRentals(statusTab, true)
    
    // Tự động poll dữ liệu ngầm mỗi 5 giây
    const interval = setInterval(() => {
      fetchRentals(statusTab, false)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [statusTab])

  async function fetchRentals(status: TabStatus, showLoading = true) {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const data = await getRentalHistory(status)
      setRentals(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch rentals'))
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  function handleOpenConfirm(id: number | string) {
    setSelectedRentalId(id)
    setIsConfirmOpen(true)
  }

  async function handleForceEnd() {
    if (!selectedRentalId) return
    setEnding(true)
    setError('')
    setSuccess('')
    try {
      await endRental(selectedRentalId)
      setSuccess(`Rental #${selectedRentalId} ended successfully.`)
      fetchRentals(statusTab)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to end rental'))
    } finally {
      setEnding(false)
      setIsConfirmOpen(false)
      setSelectedRentalId(null)
    }
  }

  async function handleForceEndAll() {
    setEndingAll(true)
    setError('')
    setSuccess('')
    try {
      await forceEndAllRentals()
      setSuccess('All active rentals have been force-ended successfully.')
      fetchRentals(statusTab)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to force-end all rentals'))
    } finally {
      setEndingAll(false)
      setIsConfirmAllOpen(false)
    }
  }

  const columns: TableColumn<RentalResult>[] = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    {
      key: 'userId',
      label: 'User',
      render: (row) => <UserCell userId={row.userId} userName={row.userName} />
    },
    { key: 'scooterId', label: 'Scooter ID', align: 'right' as const, isNumeric: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
            ['IN_USE', 'ACTIVE'].includes(row.status)
              ? 'bg-[rgba(0,209,255,0.12)] text-cyan-soft border border-[rgba(0,209,255,0.3)]'
              : 'bg-surface-elevated text-text-muted border border-border'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'startTime',
      label: 'Start',
      render: (row) => formatDateTime(row.startTime) || '-',
    },
    {
      key: 'endTime',
      label: 'End',
      render: (row) => formatDateTime(row.endTime) || '-',
    },
    {
      key: 'totalPrice',
      label: 'Price',
      align: 'right' as const,
      isNumeric: true,
      render: (row) => formatCurrency(row.totalPrice),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row) =>
        ['IN_USE', 'ACTIVE'].includes(row.status) ? (
          <DropdownMenu items={[
            { label: 'Force End', icon: <StopCircle size={14} />, danger: true, onClick: () => handleOpenConfirm(row.id) }
          ]} />
        ) : null,
    },
  ]

  const hasActiveRentals = rentals.some(row => ['IN_USE', 'ACTIVE'].includes(row.status))
  const finalColumns = hasActiveRentals ? columns : columns.filter(c => c.key !== 'actions')

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Fleet Operations"
        title="Rentals Management"
        description="Monitor active rides, view rental history, and force-end stuck trips."
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'IN_USE', 'COMPLETED'] as TabStatus[]).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                statusTab === tab
                  ? 'border-brand text-text-strong bg-brand-soft'
                  : 'border-transparent text-text-muted hover:text-text hover:bg-surface-elevated'
              }`}
              onClick={() => setStatusTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        {hasActiveRentals && (
          <Button variant="destructive" onClick={() => setIsConfirmAllOpen(true)} className="px-4 py-2 min-h-10 text-sm">
            Force End All
          </Button>
        )}
      </div>

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-bg/50 backdrop-blur-sm rounded-md">
            <span className="text-cyan-soft font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</span>
          </div>
        )}
        <Table
          columns={finalColumns}
          rows={rentals}
          rowKey={(row) => row.id}
          emptyState={
            <EmptyState
              icon={<Inbox size={24} />}
              title="No rentals found"
              description="There are currently no rentals matching your criteria."
            />
          }
        />
      </div>

      <Modal
        open={isConfirmOpen}
        title="Force End Rental"
        onClose={() => setIsConfirmOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)} disabled={ending}>
              Cancel
            </Button>
            <Button onClick={handleForceEnd} disabled={ending}>
              {ending ? 'Ending...' : 'Confirm End'}
            </Button>
          </div>
        }
      >
        <p className="text-text">
          Are you sure you want to force-end rental <strong>#{selectedRentalId}</strong>?
          This will calculate the final price and charge the user's wallet.
        </p>
      </Modal>

      <Modal
        open={isConfirmAllOpen}
        title="Force End All Rentals"
        onClose={() => setIsConfirmAllOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsConfirmAllOpen(false)} disabled={endingAll}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleForceEndAll} disabled={endingAll}>
              {endingAll ? 'Ending...' : 'Confirm End All'}
            </Button>
          </div>
        }
      >
        <p className="text-text">
          Are you sure you want to force-end <strong>all active rentals</strong>?
          This will stop all trips, stop the simulation bots, and charge the users' wallets.
        </p>
      </Modal>
    </div>
  )
}