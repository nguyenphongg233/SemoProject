// Admin analytics page using the optimal-stations API.
import { useState } from 'react'
// FIX 1: Dùng type-only import cho FormEvent và ChangeEvent
import type { FormEvent, ChangeEvent } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Table, TextField } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { getAllScooters } from '../../features/scooters'
import { getOptimalStations } from '../../features/analytics'
import { getApiErrorMessage } from '../../utils/apiError'

// FIX 2: Import đúng Type Scooter của dự án thay vì tự định nghĩa bừa
import type { Scooter, LatLngPos } from '../../types/models'


export default function AnalyticsPage() {
  const [k, setK] = useState<number>(3)
  const [points, setPoints] = useState<LatLngPos[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  // Hiện tại state này đã mang đúng cấu trúc mà <ScooterMap /> yêu cầu
  const [scooters, setScooters] = useState<Scooter[]>([])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const [data, scootersData] = await Promise.all([
        getOptimalStations(k), 
        getAllScooters()
      ])
      setPoints(Array.isArray(data) ? data : [])
      setScooters(Array.isArray(scootersData) ? scootersData : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load optimal stations'))
      setPoints([])
    } finally {
      setLoading(false)
    }
  }

  // ... Các phần còn lại của component giữ nguyên giống như file trước ...

  const columns = [
    { key: 'lat', label: 'Latitude' },
    { key: 'lng', label: 'Longitude' },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Admin"
        title="Analytics"
        description="Calculate optimal charging stations from the analytics endpoint."
      />

      {error && <Alert>{error}</Alert>}

      <Card>
        <form className="analytics-form" onSubmit={handleSubmit}>
          <TextField
            label="Number of stations (k)"
            type="number"
            min="1"
            name="k"
            value={k}
            // 4. Converted string value to number before saving to state
            onChange={(event: ChangeEvent<HTMLInputElement>) => setK(Number(event.target.value))}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Calculating…' : 'Calculate'}
          </Button>
        </form>
      </Card>

      <Card>
        <div style={{ height: 420 }}>
          <ScooterMap
            scooters={scooters}
            // 5. TypeScript now safely reads .lat and .lng from points array
            stations={points.map((p, i) => ({ lat: p.lat, lng: p.lng, name: `Station ${i + 1}` }))}
          />
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>
          KMeans cluster centers shown on the map as stations.
        </p>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={points}
          rowKey={(row: LatLngPos, index: number) => `${row.lat}-${row.lng}-${index}`}
          emptyMessage="No stations calculated yet."
        />
      </Card>
    </div>
  )
}