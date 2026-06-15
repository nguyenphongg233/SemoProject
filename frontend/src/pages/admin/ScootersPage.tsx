// Admin scooters management page with create/update support.
import { useEffect, useMemo, useState } from 'react'
// FIX 1: Thêm type-only import cho các Event React
import type { SyntheticEvent, ChangeEvent } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { APP_ENV } from '@/config/env'

import { Download, Pencil, LayoutGrid, CheckCircle2, PlayCircle, Wrench, Zap } from 'lucide-react'

import { SectionHeader,
  Alert, Button, Card, Modal, Table, TextField,
  ScooterMap, DropdownMenu
 } from '@/components'
import { SCOOTER_STATUSES } from '@/constants'
import { createScooter, getAllScooters, updateScooter, exportScootersExcel } from '@/features/scooters'
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
    [SCOOTER_STATUSES.CHARGING]: 'Charging',
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

    async function loadScooters(showLoading = true) {
      try {
        if (showLoading) setLoading(true)
        setError('')
        const data = await getAllScooters()
        if (mounted) {
          setScooters(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted && showLoading) {
          setError(getApiErrorMessage(err, 'Unable to load scooters'))
        }
      } finally {
        if (mounted && showLoading) {
          setLoading(false)
        }
      }
    }

    loadScooters(true)
    const interval = setInterval(() => loadScooters(false), 5000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${APP_ENV.apiUrl}/ws`),
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe('/topic/scooters', (msg) => {
          if (msg.body) {
            const activeScooters: Scooter[] = JSON.parse(msg.body);
            setScooters((prev) => {
              const map = new Map(activeScooters.map(s => [s.id, s]));
              return prev.map(s => map.has(s.id) ? { ...s, ...map.get(s.id) } : s);
            });
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const summary = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((item) => item.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((item) => item.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((item) => item.status === SCOOTER_STATUSES.MAINTENANCE).length
    const charging = scooters.filter((item) => item.status === SCOOTER_STATUSES.CHARGING).length

    return [
      { label: 'Total Fleet', value: total, icon: <LayoutGrid size={20} /> },
      { label: 'Available', value: available, icon: <CheckCircle2 size={20} /> },
      { label: 'In Use', value: inUse, icon: <PlayCircle size={20} /> },
      { label: 'Maintenance', value: maintenance, icon: <Wrench size={20} /> },
      { label: 'Charging', value: charging, icon: <Zap size={20} /> },
    ]
  }, [scooters])

  // FIX 6: Định nghĩa kiểu dữ liệu row cụ thể cho Table columns
  const columns = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'name', label: 'Scooter' },
    { key: 'batteryLevel', label: 'Battery', align: 'right' as const, isNumeric: true, render: (row: Scooter) => formatBatteryLevel(row.batteryLevel) },
    { key: 'status', label: 'Status', render: (row: Scooter) => getStatusLabel(row.status) },
    { key: 'cycleCount', label: 'Cycles', align: 'right' as const, isNumeric: true },
    {
      key: 'stateOfHealth',
      label: 'SOH',
      align: 'right' as const,
      isNumeric: true,
      render: (row: Scooter) => {
        const soh = row.stateOfHealth
        return soh != null ? `${soh.toFixed(2)}` : '-'
      },
    },
    {
      key: 'temperature',
      label: 'Temp (°C)',
      align: 'right' as const,
      isNumeric: true,
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
      align: 'center' as const,
      render: (row: Scooter) => (
        <DropdownMenu items={[
          { label: 'Edit', icon: <Pencil size={14} />, onClick: () => openEdit(row) }
        ]} />
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

  async function handleExportExcel() {
    try {
      const blob = await exportScootersExcel();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'scooters.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to export Excel file'));
    }
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Scooters"
        description="Create and update scooters, battery levels, and fleet status."
        actions={
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              title="Export Excel (.xlsx)"
              onClick={handleExportExcel}
              leadingIcon={<Download size={16} />}
            >
              Export Excel
            </Button>
            <Button onClick={openCreate}>New scooter</Button>
          </div>
        }
      />

      <div className="grid gap-[1.1rem] grid-cols-5 max-[1100px]:grid-cols-3 max-[700px]:grid-cols-2 max-sm:grid-cols-1">
        {summary.map((item) => (
          <Card key={item.label}>
            <div className="flex items-center gap-2 mb-2 text-text-faded">
              {item.icon}
              <p className="font-semibold text-xs uppercase tracking-[0.12em]">
                {item.label}
              </p>
            </div>
            <div className="text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-cyan-soft)_120%)] bg-clip-text text-transparent leading-[1.1]">
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
            <span className="text-sm font-semibold text-(--text)">Status</span>
            <select
              className="w-full min-h-13 p-4 border border-(--border) rounded-[14px]
                       bg-[rgba(11,17,32,0.65)] text-(--text-strong)
                         transition-[border-color,box-shadow,background] duration-200 ease-out
                         placeholder:text-(--text-faded) hover:border-(--border-strong)
                         focus:outline-none focus:border-(--border-glow)
                         focus:bg-[rgba(11,17,32,0.85)]
                         focus:shadow-[0_0_0_4px_rgba(0,209,255,0.15),0_0_24px_rgba(0,82,255,0.18)]"
              value={form.status}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setForm((current) => ({ ...current, status: event.target.value }))}
            >
              {Object.values(SCOOTER_STATUSES).map((status) => (
                <option key={status} value={status}>
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