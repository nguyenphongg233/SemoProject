import { useState, useEffect } from 'react'

import { SectionHeader, Alert, Button, Table, Modal } from '@/components'
import { getRentalHistory, endRental } from '@/features/rentals'
import { formatDateTime, formatCurrency, getApiErrorMessage } from '@/utils'
import type { TableColumn } from '@/components/ui/Table'

interface RentalResult {
  id: number | string
  userId: number | string
  scooterId: number | string
  status: string
  startTime: string
  endTime: string | null
  totalPrice: number
}

type TabStatus = 'ALL' | 'ACTIVE' | 'COMPLETED'

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalResult[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  const [statusTab, setStatusTab] = useState<TabStatus>('ALL')
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [selectedRentalId, setSelectedRentalId] = useState<number | string | null>(null)
  const [ending, setEnding] = useState(false)

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

  const columns: TableColumn<RentalResult>[] = [
    { key: 'id', label: 'ID' },
    { key: 'userId', label: 'User ID' },
    { key: 'scooterId', label: 'Scooter ID' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${
            row.status === 'ACTIVE'
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
      render: (row) => formatCurrency(row.totalPrice),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) =>
        row.status === 'ACTIVE' ? (
          <Button
            variant="secondary"
            onClick={() => handleOpenConfirm(row.id)}
            disabled={loading || ending}
          >
            Force End
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Fleet Operations"
        title="Rentals Management"
        description="Monitor active rides, view rental history, and force-end stuck trips."
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="flex items-center gap-2 border-b border-border pb-4">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as TabStatus[]).map((tab) => (
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

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-bg/50 backdrop-blur-sm rounded-md">
            <span className="text-cyan-soft font-bold tracking-widest uppercase text-sm animate-pulse">Loading...</span>
          </div>
        )}
        <Table
          columns={columns}
          rows={rentals}
          rowKey={(row) => row.id}
          emptyMessage={loading ? 'Loading rentals...' : 'No rentals found.'}
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
    </div>
  )
}