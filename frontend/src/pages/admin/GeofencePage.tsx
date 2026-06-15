import { useEffect, useState } from 'react'
import type { SyntheticEvent, ChangeEvent } from 'react'
import { Map, Pencil, Trash2, X } from 'lucide-react'
import { SectionHeader, Alert, Button, Card, Table, TextField, DropdownMenu, ScooterMap } from '@/components'
import { getAllGeofenceZones, createGeofenceZone, updateGeofenceZone, deleteGeofenceZone } from '@/features/geofence'
import { getAllScooters } from '@/features/scooters'
import { getApiErrorMessage } from '@/utils'
import type { Scooter } from '@/types/models'

interface GeofenceZone {
  id: number | null
  name: string
  centerLat: number
  centerLng: number
  radius: number
  radiusKm?: number
  status?: string
}

interface GeofenceFormState {
  id: number | null
  name: string
  centerLat: number | string
  centerLng: number | string
  radius: number | string
  status?: string
}

const initialForm: GeofenceFormState = {
  id: null,
  name: '',
  centerLat: '',
  centerLng: '',
  radius: 100, // Default 100m
  status: 'ACTIVE',
}

export default function GeofencePage() {
  const [zones, setZones] = useState<GeofenceZone[]>([])
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [form, setForm] = useState<GeofenceFormState>(initialForm)

  useEffect(() => {
    let mounted = true
    async function loadData() {
      try {
        setLoading(true)
        setError('')
        const [zonesData, scootersData] = await Promise.all([
          getAllGeofenceZones(),
          getAllScooters()
        ])
        
        const mappedData = (Array.isArray(zonesData) ? zonesData : []).map((z: any) => ({
          ...z,
          radius: z.radiusKm ? Math.round(z.radiusKm * 1000) : (z.radius || 0),
          status: 'ACTIVE'
        }))
        
        if (mounted) {
          setZones(mappedData)
          setScooters(Array.isArray(scootersData) ? scootersData : [])
        }
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err, 'Unable to load geofence zones and scooters'))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const columns = [
    { key: 'id', label: 'ID', align: 'right' as const, isNumeric: true },
    { key: 'name', label: 'Zone Name' },
    { key: 'centerLat', label: 'Latitude', align: 'right' as const, isNumeric: true },
    { key: 'centerLng', label: 'Longitude', align: 'right' as const, isNumeric: true },
    { key: 'radius', label: 'Radius (m)', align: 'right' as const, isNumeric: true },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row: GeofenceZone) => (
        <DropdownMenu items={[
          { label: 'Edit', icon: <Pencil size={14} />, onClick: () => openEdit(row) },
          { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => handleDelete(row.id as number), danger: true }
        ]} />
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsModalOpen(true)
  }

  function openEdit(row: GeofenceZone) {
    setForm({
      id: row.id,
      name: row.name,
      centerLat: row.centerLat,
      centerLng: row.centerLng,
      radius: row.radius,
      status: row.status || 'ACTIVE',
    })
    setIsModalOpen(true)
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this zone?')) return
    try {
      setLoading(true)
      await deleteGeofenceZone(id)
      const data = await getAllGeofenceZones()
      const mappedData = (Array.isArray(data) ? data : []).map((z: any) => ({
        ...z,
        radius: z.radiusKm ? Math.round(z.radiusKm * 1000) : (z.radius || 0),
        status: 'ACTIVE'
      }))
      setZones(mappedData)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete zone'))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      name: form.name,
      centerLat: Number(form.centerLat),
      centerLng: Number(form.centerLng),
      radiusKm: Number(form.radius) / 1000,
    }

    try {
      if (form.id) {
        await updateGeofenceZone(form.id, payload)
      } else {
        await createGeofenceZone(payload)
      }
      const data = await getAllGeofenceZones()
      const mappedData = (Array.isArray(data) ? data : []).map((z: any) => ({
        ...z,
        radius: z.radiusKm ? Math.round(z.radiusKm * 1000) : (z.radius || 0),
        status: 'ACTIVE'
      }))
      setZones(mappedData)
      setIsModalOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save geofence zone'))
    } finally {
      setSaving(false)
    }
  }

  function handleMapClick(pos: { lat: number, lng: number }) {
    if (!isModalOpen) {
      setForm({
        ...initialForm,
        centerLat: pos.lat.toFixed(5),
        centerLng: pos.lng.toFixed(5),
      })
      setIsModalOpen(true)
    } else {
      setForm({
        ...form,
        centerLat: pos.lat.toFixed(5),
        centerLng: pos.lng.toFixed(5),
      })
    }
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Geofence Zones"
        description="Manage safe zones and speed limits for the fleet."
        actions={
          <Button onClick={openCreate} leadingIcon={<Map size={16} />}>
            New Zone
          </Button>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-start gap-6">
        {/* Main Content: Map & Table */}
        <div className="flex-1 min-w-0 grid gap-6">
          <Card>
            <div className="mb-4">
              <ScooterMap 
                scooters={scooters}
                zones={zones} 
                onMapClick={handleMapClick} 
                previewRadius={isModalOpen ? Number(form.radius) : undefined}
              />
            </div>
            <p className="mt-2 text-text-muted mb-4">
              Click anywhere on the map to create a new zone at that location, or click while editing to move the zone center.
            </p>
            <Table
              columns={columns}
              rows={zones}
              rowKey={(row: GeofenceZone) => row.id?.toString() ?? ''}
              emptyMessage={loading ? 'Loading zones...' : 'No geofence zones configured.'}
            />
          </Card>
        </div>

        {/* Side Panel */}
        {isModalOpen && (
          <div className="w-96 shrink-0 bg-surface-elevated border border-border rounded-xl p-6 shadow-xl sticky top-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">{form.id ? 'Edit Zone' : 'New Zone'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/5 text-text-faded hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form id="geofence-form" className="grid gap-5" onSubmit={handleSubmit}>
              <TextField
                label="Zone Name"
                name="name"
                value={form.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value })}
                required
              />
              <TextField
                label="Center Latitude"
                type="number"
                name="centerLat"
                step="0.00001"
                value={form.centerLat}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, centerLat: e.target.value })}
                required
              />
              <TextField
                label="Center Longitude"
                type="number"
                name="centerLng"
                step="0.00001"
                value={form.centerLng}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, centerLng: e.target.value })}
                required
              />
              
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-(--text) flex justify-between">
                  <span>Radius (meters)</span>
                  <span className="text-cyan-soft">{form.radius}m</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="40000"
                  step="10"
                  value={form.radius}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, radius: e.target.value })}
                  className="w-full accent-cyan-soft"
                />
                <TextField
                  type="number"
                  name="radius"
                  min="10"
                  max="40000"
                  value={form.radius}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, radius: e.target.value })}
                  required
                />
                <p className="text-xs text-text-faded mt-1">Maximum 40,000 meters (40km)</p>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
