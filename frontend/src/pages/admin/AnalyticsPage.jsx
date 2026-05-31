// Admin analytics page using the optimal-stations API.
import { useState } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Table, TextField } from '../../components/ui'
import { getOptimalStations } from '../../features/analytics'
import { getApiErrorMessage } from '../../utils/apiError'

export default function AnalyticsPage() {
  const [k, setK] = useState(3)
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await getOptimalStations(Number(k))
      setPoints(Array.isArray(data) ? data : [])
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