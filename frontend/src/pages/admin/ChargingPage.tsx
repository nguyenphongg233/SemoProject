import { useState, useEffect } from 'react'
import { Zap, CheckCircle2 } from 'lucide-react'
import { SectionHeader, Alert, Button, Card, Table, ScooterMap } from '@/components'
import { autoScheduleCharging, completeCharging } from '@/features/charging'
import { getAllScooters } from '@/features/scooters'
import { getApiErrorMessage, formatBatteryLevel } from '@/utils'
import type { Scooter } from '@/types/models'

export default function ChargingPage() {
  const [chargingScooters, setChargingScooters] = useState<Scooter[]>([])
  const [allScooters, setAllScooters] = useState<Scooter[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  
  async function fetchAllScooters() {
    try {
      const data = await getAllScooters()
      const scooters = Array.isArray(data) ? data : []
      setAllScooters(scooters)
      // Tự động nạp các xe ĐANG SẠC vào bảng khi mở trang
      setChargingScooters(scooters.filter(s => s.status === 'CHARGING'))
    } catch (err) {
      console.error('Failed to load all scooters', err)
    }
  }

  useEffect(() => {
    fetchAllScooters()
  }, [])
  
  async function handleAutoSchedule() {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const data = await autoScheduleCharging()
      setChargingScooters(Array.isArray(data) ? data : [])
      setSuccess(`Successfully scheduled ${Array.isArray(data) ? data.length : 0} scooters for charging.`)
      fetchAllScooters()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to schedule charging'))
    } finally {
      setLoading(false)
    }
  }

  async function handleCompleteCharging(id: number | string) {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await completeCharging(id)
      setChargingScooters((prev) => prev.filter((s) => s.id !== id))
      setSuccess(`Successfully completed charging for scooter #${id}`)
      fetchAllScooters()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to complete charging'))
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'name', label: 'Scooter Name' },
    { key: 'batteryLevel', label: 'Battery Level', align: 'right' as const, isNumeric: true, render: (row: Scooter) => formatBatteryLevel(row.batteryLevel) },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row: Scooter) => (
        <Button 
          variant="secondary" 
          onClick={() => row.id && handleCompleteCharging(row.id)}
          disabled={loading}
          leadingIcon={<CheckCircle2 size={14} />}
        >
          Complete
        </Button>
      ),
    },
  ]

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Charging Management"
        description="Auto-schedule charging for scooters with low battery and manage charging states."
        actions={
          <Button 
            onClick={handleAutoSchedule} 
            disabled={loading}
            leadingIcon={<Zap size={16} />}
          >
            {loading ? 'Processing...' : 'Auto-Schedule Charging'}
          </Button>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <Card>
        <div className="mb-4">
          <ScooterMap scooters={allScooters} />
        </div>
        <p className="mt-2 text-text-muted mb-4">
          Clicking "Auto-Schedule Charging" will find scooters that need charging and put them into CHARGING status. They will appear in the table and map below.
        </p>
        <Table
          columns={columns}
          rows={chargingScooters}
          rowKey={(row: Scooter) => row.id?.toString() ?? ''}
          emptyMessage={loading ? 'Processing...' : 'No scooters are currently charging in this session.'}
        />
      </Card>
    </div>
  )
}
