// Admin scooters management page with create/update support.
import { useEffect, useMemo, useState } from 'react'
// FIX 1: Thêm type-only import cho các Event React
import type { SyntheticEvent, ChangeEvent } from 'react'

import { SectionHeader,
  Alert, Button, Card, Modal, Table, TextField,
  ScooterMap
 } from '@/components'
import { SCOOTER_STATUSES } from '@/constants'
import { createScooter, getAllScooters, updateScooter } from '@/features/scooters'
import { formatBatteryLevel, formatDateTime, getApiErrorMessage } from '@/utils'

import type { Scooter } from '@/types/models'

// FIX 3: Định nghĩa Interface riêng cho Form State (Cho phép batteryLevel tạm thời nhận cả chuỗi khi đang gõ)
interface ScooterFormState {
  id: number | null
  name: string
  batteryLevel: number | string
  status: string
  currentLat: number | string
  currentLng: number | string
}

const initialForm: ScooterFormState = {
  id: null,
  name: '',
  batteryLevel: 100,
  status: SCOOTER_STATUSES.AVAILABLE,
  currentLat: '',
  currentLng: '',
}

// FIX 4: Định nghĩa type cho tham số status
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    [SCOOTER_STATUSES.AVAILABLE]: 'Available',
    [SCOOTER_STATUSES.IN_USE]: 'In use',
    [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
  }

  return labels[status] || status || 'Unknown'
}

export default function ScootersPage() {
  // FIX 5: Ép kiểu mảng dữ liệu thành Scooter[] thay vì never[]
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [form, setForm] = useState<ScooterFormState>(initialForm)

  useEffect(() => {
    let mounted = true

    async function loadScooters() {
      try {
        setLoading(true)
        setError('')
        const data = await getAllScooters()
        if (mounted) {
          setScooters(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted) {
          setError(getApiErrorMessage(err, 'Unable to load scooters'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadScooters()
    return () => {
      mounted = false
    }
  }, [])

  const summary = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((item) => item.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((item) => item.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((item) => item.status === SCOOTER_STATUSES.MAINTENANCE).length

    return [
      { label: 'Total', value: total },
      { label: 'Available', value: available },
      { label: 'In use', value: inUse },
      { label: 'Maintenance', value: maintenance },
    ]
  }, [scooters])

  // FIX 6: Định nghĩa kiểu dữ liệu row cụ thể cho Table columns
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Scooter' },
    { key: 'batteryLevel', label: 'Battery', render: (row: Scooter) => formatBatteryLevel(row.batteryLevel) },
    { key: 'status', label: 'Status', render: (row: Scooter) => getStatusLabel(row.status) },
    { key: 'cycleCount', label: 'Cycles' },
    {
      key: 'stateOfHealth',
      label: 'SOH',
      render: (row: Scooter) => {
        const soh = row.stateOfHealth
        return soh != null ? `${soh.toFixed(2)}` : '-'
      },
    },
    {
      key: 'temperature',
      label: 'Temp (°C)',
      render: (row: Scooter) => {
        const temperature = Number(row.temperature)
        return Number.isFinite(temperature) ? `${temperature.toFixed(1)}` : '-'
      },
    },
    {
      key: 'location',
      label: 'Location',
      render: (row: Scooter) =>
        row.currentLat && row.currentLng ? `${Number(row.currentLat).toFixed(5)}, ${Number(row.currentLng).toFixed(5)}` : '-',
    },
    { key: 'createdAt', label: 'Created', render: (row: Scooter) => formatDateTime(row.createdAt) || '-' },
    { key: 'updatedAt', label: 'Updated', render: (row: Scooter) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Scooter) => (
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => openEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsModalOpen(true)
  }

  // FIX 7: Định nghĩa type cho tham số callback từ Map click
  function handleMapClick({ lat, lng }: { lat: number; lng: number }) {
    setForm({
      id: null,
      name: '',
      batteryLevel: 100,
      status: SCOOTER_STATUSES.AVAILABLE,
      currentLat: lat?.toFixed ? lat.toFixed(5) : lat,
      currentLng: lng?.toFixed ? lng.toFixed(5) : lng,
    })
    setIsModalOpen(true)
  }

  // FIX 8: Định nghĩa kiểu dữ liệu row là Scooter khi click sửa
  function openEdit(row: Scooter) {
    setForm({
      id: Number(row.id),
      name: row.name || '',
      batteryLevel: row.batteryLevel ?? 100,
      status: row.status || SCOOTER_STATUSES.AVAILABLE,
      currentLat: row.currentLat ?? '',
      currentLng: row.currentLng ?? '',
    })
    setIsModalOpen(true)
  }

  // FIX 9: Khai báo SyntheticEvent cho hàm submit
  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      batteryLevel: Number(form.batteryLevel),
      status: form.status,
      currentLat: form.currentLat === '' ? null : Number(form.currentLat),
      currentLng: form.currentLng === '' ? null : Number(form.currentLng),
    }

    try {
      if (form.id) {
        await updateScooter(form.id, payload)
      } else {
        await createScooter(payload)
      }

      const data = await getAllScooters()
      setScooters(Array.isArray(data) ? data : [])
      setIsModalOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save scooter'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Scooters"
        description="Create and update scooters, battery levels, and fleet status."
        actions={<Button onClick={openCreate}>New scooter</Button>}
      />

      <div className="grid gap-[1.1rem] grid-cols-4 max-[980px]:grid-cols-2 max-sm:grid-cols-1">
        {summary.map((item) => (
          <Card key={item.label}>
            <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
              {item.label}
            </p>
            <div 
              className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-clip-text text-transparent leading-[1.1]
                        bg-[linear-gradient(135deg,var(--color-text-strong),var(--color-accent)_120%)]
                        dark:bg-[linear-gradient(135deg,#FFFFFF,var(--color-accent)_120%)]"
            >
              {loading ? '—' : item.value}
            </div>
          </Card>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        <div>
          <ScooterMap scooters={scooters} onMapClick={handleMapClick} />
        </div>
        <p className="mt-2">
          Click on the map to add a scooter at that location.
        </p>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={scooters}
          rowKey={(row: Scooter) => row.id?.toString() ?? ''}
          emptyMessage={loading ? 'Loading scooters...' : 'No scooters available.'}
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={form.id ? 'Edit scooter' : 'New scooter'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="scooter-form" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      >
        <form id="scooter-form" className="grid gap-5" onSubmit={handleSubmit}>
          <TextField
            label="Scooter name"
            name="name"
            value={form.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />

          <TextField
            label="Battery level"
            type="number"
            name="batteryLevel"
            min="0"
            max="100"
            value={form.batteryLevel}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, batteryLevel: event.target.value }))}
            required
          />

          <TextField
            label="Latitude"
            type="number"
            name="currentLat"
            step="0.00001"
            value={form.currentLat}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, currentLat: event.target.value }))}
            placeholder="21.00520"
          />

          <TextField
            label="Longitude"
            type="number"
            name="currentLng"
            step="0.00001"
            value={form.currentLng}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, currentLng: event.target.value }))}
            placeholder="105.84330"
          />

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-text-strong">{/* Sửa text-(--text) thành token chuẩn */}
              Status
            </span>
            <select
              className="w-full min-h-13 p-4 border border-border rounded-[14px]
                        bg-surface text-text-strong
                        transition-[border-color,box-shadow,background] duration-200 ease-out
                        placeholder:text-text-faded hover:border-border-strong
                        focus:outline-none focus:border-border-glow
                        focus:bg-bg-accent
                        focus:shadow-[var(--sh-soft),var(--sh-glow-blue)]" /* Đổ bóng kép thích ứng theo Theme */
              value={form.status}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => 
                setForm((current) => ({ ...current, status: event.target.value }))
              }
            >
              {Object.values(SCOOTER_STATUSES).map((status) => (
                <option 
                  key={status} 
                  value={status}
                  className="bg-bg-accent text-text-strong"
                >
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}