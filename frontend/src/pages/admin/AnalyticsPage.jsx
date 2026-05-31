// Admin analytics page using the optimal-stations API.
import { useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Table, TextField } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { getAllScooters } from '../../features/scooters'
import { getOptimalStations } from '../../features/analytics'
import { getApiErrorMessage } from '../../utils/apiError'

export default function AnalyticsPage() {
  const [k, setK] = useState(3)
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scooters, setScooters] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const [data, scootersData] = await Promise.all([getOptimalStations(Number(k)), getAllScooters()])
      setPoints(Array.isArray(data) ? data : [])
      setScooters(Array.isArray(scootersData) ? scootersData : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load optimal stations'))
      setPoints([])
    } finally {
      setLoading(false)
    }
  }

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
            onChange={(event) => setK(event.target.value)}
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
          rowKey={(row, index) => `${row.lat}-${row.lng}-${index}`}
          emptyMessage="No stations calculated yet."
        />
      </Card>
    </div>
  )
}