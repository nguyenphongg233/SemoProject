// Admin analytics page using the optimal-stations API.
import { useState, useEffect } from 'react'
// FIX 1: Dùng type-only import cho SyntheticEvent và ChangeEvent
import type { SyntheticEvent, ChangeEvent } from 'react'

import { SectionHeader,
  Alert, Button, Card, Table, TextField,
  ScooterMap
 } from '@/components'
import { getAllScooters } from '@/features/scooters'
import { getRentalHistory } from '@/features/rentals'
import { getAllMaintenanceLogs } from '@/features/maintenance'
import { getOptimalStations } from '@/features/analytics'
import { getApiErrorMessage, formatCurrency } from '@/utils'

// FIX 2: Import đúng Type Scooter của dự án thay vì tự định nghĩa bừa
import type { Scooter, LatLngPos } from '@/types/models'


export default function AnalyticsPage() {
  const [k, setK] = useState<number>(3)
  const [points, setPoints] = useState<LatLngPos[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  
  // Dashboard Metrics Data
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [rentals, setRentals] = useState<any[]>([])
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Load Dashboard Data
  useEffect(() => {
    let mounted = true
    async function loadDashboard() {
      try {
        setDashboardLoading(true)
        const [scooterData, rentalData, logsData] = await Promise.all([
          getAllScooters().catch(() => []),
          getRentalHistory('ALL').catch(() => []),
          getAllMaintenanceLogs().catch(() => []) // Catching error since backend might not implement this yet
        ])
        if (mounted) {
          setScooters(Array.isArray(scooterData) ? scooterData : [])
          setRentals(Array.isArray(rentalData) ? rentalData : [])
          setMaintenanceLogs(Array.isArray(logsData) ? logsData : [])
        }
      } catch (err) {
        if (mounted) console.error('Failed to load dashboard metrics', err)
      } finally {
        if (mounted) setDashboardLoading(false)
      }
    }
    loadDashboard()
    return () => { mounted = false }
  }, [])

  // Calculate Metrics
  const totalRevenue = rentals.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0)
  const totalRides = rentals.length
  
  const fleetTotal = scooters.length
  const fleetAvailable = scooters.filter(s => s.status === 'AVAILABLE').length
  
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, log) => sum + (Number(log.cost) || 0), 0)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
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
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Analytics & Operations"
        description="Monitor system revenue, fleet utilization, and calculate optimal charging stations."
      />

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-[1.1rem] grid-cols-4 max-[980px]:grid-cols-2 max-sm:grid-cols-1">
        <Card>
          <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
            Total Revenue
          </p>
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-cyan-soft)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : formatCurrency(totalRevenue)}
          </div>
        </Card>
        <Card>
          <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
            Total Rides
          </p>
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-cyan-soft)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : totalRides}
          </div>
        </Card>
        <Card>
          <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
            Fleet Available
          </p>
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--success)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : `${Math.round((fleetAvailable / (fleetTotal || 1)) * 100)}%`}
          </div>
        </Card>
        <Card>
          <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
            Maintenance Costs
          </p>
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--warning)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : formatCurrency(totalMaintenanceCost)}
          </div>
        </Card>
      </div>

      <SectionHeader 
        eyebrow="AI Insights"
        title="Optimal Charging Stations"
        description="Run K-Means clustering algorithm on live fleet data to determine optimal locations for future charging stations."
      />

      <Card>
        <form className="grid gap-4 grid-cols-[minmax(0,1fr)_auto] items-end max-sm:grid-cols-1" onSubmit={handleSubmit}>
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
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </form>
      </Card>

      <Card>
        <div>
          <ScooterMap
            scooters={scooters}
            // 5. TypeScript now safely reads .lat and .lng from points array
            stations={points.map((p, i) => ({ lat: p.lat, lng: p.lng, name: `Station ${i + 1}` }))}
          />
        </div>
        <p className="mt-2">
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