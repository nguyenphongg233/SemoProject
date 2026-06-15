// Admin analytics page using the optimal-stations API.
import { useState, useEffect } from 'react'
// FIX 1: Dùng type-only import cho SyntheticEvent và ChangeEvent
import type { SyntheticEvent, ChangeEvent } from 'react'

import { SectionHeader,
  Alert, Button, Card, Table, TextField,
  ScooterMap
 } from '@/components'
import { getAllScooters } from '@/features/scooters'
import { getOptimalStations, getOptimalStationsHDBSCAN } from '@/features/analytics'
import { getDashboardStats } from '@/features/statistics'
import { getApiErrorMessage, formatCurrency } from '@/utils'

// FIX 2: Import đúng Type Scooter của dự án thay vì tự định nghĩa bừa
import type { Scooter, LatLngPos, DashboardStats } from '@/types/models'


export default function AnalyticsPage() {
  const [method, setMethod] = useState<'KMEANS' | 'HDBSCAN'>('KMEANS')
  const [k, setK] = useState<number>(3)
  const [minClusterSize, setMinClusterSize] = useState<number>(5)
  const [points, setPoints] = useState<LatLngPos[]>([])
  const [clusterAssignments, setClusterAssignments] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  
  // Dashboard Metrics Data
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [scooters, setScooters] = useState<Scooter[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Load Dashboard Data
  useEffect(() => {
    let mounted = true
    async function loadDashboard() {
      try {
        setDashboardLoading(true)
        const [statsData, scooterData] = await Promise.all([
          getDashboardStats().catch(() => null),
          getAllScooters().catch(() => [])
        ])
        if (mounted) {
          if (statsData) setStats(statsData)
          setScooters(Array.isArray(scooterData) ? scooterData : [])
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
  const totalRevenue = stats?.totalRevenue || 0
  const totalRides = stats?.totalCompletedRentals || 0
  
  const fleetTotal = scooters.length
  const fleetAvailable = stats?.availableScooters || 0
  
  const totalMaintenanceCost = stats?.totalMaintenanceCost || 0

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const fetchStations = method === 'KMEANS' ? getOptimalStations(k) : getOptimalStationsHDBSCAN(minClusterSize);
      const [data, scootersData] = await Promise.all([
        fetchStations, 
        getAllScooters()
      ])
      const newPoints = Array.isArray(data) ? data : [];
      const newScooters = Array.isArray(scootersData) ? scootersData : [];
      
      setPoints(newPoints)
      setScooters(newScooters)
      
      const assignments: Record<number, number> = {}
      if (newPoints.length > 0) {
        newScooters.forEach(scooter => {
          if (scooter.currentLat == null || scooter.currentLng == null) return;
          let minDistance = Infinity;
          let closestIdx = -1;
          newPoints.forEach((centroid, idx) => {
            const dist = Math.pow(Number(scooter.currentLat) - centroid.lat, 2) + Math.pow(Number(scooter.currentLng) - centroid.lng, 2);
            if (dist < minDistance) {
              minDistance = dist;
              closestIdx = idx;
            }
          });
          assignments[scooter.id] = closestIdx;
        });
      }
      setClusterAssignments(assignments)
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
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-success)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : `${Math.round((fleetAvailable / (fleetTotal || 1)) * 100)}%`}
          </div>
        </Card>
        <Card>
          <p className="text-text-faded font-semibold text-sm uppercase tracking-[0.12em]">
            Maintenance Costs
          </p>
          <div className="mt-2 text-4xl font-extrabold tracking-[-0.04em] bg-[linear-gradient(135deg,#fff,var(--color-warning)_120%)] bg-clip-text text-transparent leading-[1.1]">
            {dashboardLoading ? '—' : formatCurrency(totalMaintenanceCost)}
          </div>
        </Card>
      </div>

      <SectionHeader 
        eyebrow="AI Insights"
        title="Optimal Charging Stations"
        description="Run clustering algorithms on live fleet data to determine optimal locations for future charging stations."
      />

      <Card>
        <form className="grid gap-4 grid-cols-1 sm:grid-cols-[1fr_2fr_auto] items-end" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-(--text)">Algorithm</span>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value as 'KMEANS' | 'HDBSCAN')}
              className="w-full min-h-13 p-4 border border-border rounded-[14px] bg-surface text-text-strong transition-[border-color,box-shadow,background] duration-200 ease-out focus:outline-none focus:border-brand focus:bg-surface-elevated focus:shadow-[0_0_0_4px_var(--color-brand-soft),0_0_24px_var(--color-brand-soft)] appearance-none cursor-pointer"
            >
              <option value="KMEANS">K-Means (Fixed K)</option>
              <option value="HDBSCAN">HDBSCAN (Density-based)</option>
            </select>
          </label>
          
          {method === 'KMEANS' ? (
            <TextField
              label="Number of stations (k)"
              type="number"
              min="1"
              name="k"
              value={k}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setK(Number(event.target.value))}
              required
            />
          ) : (
            <TextField
              label="Minimum Cluster Size"
              type="number"
              min="1"
              name="minClusterSize"
              value={minClusterSize}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setMinClusterSize(Number(event.target.value))}
              required
            />
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate'}
          </Button>
        </form>
      </Card>

      <Card>
        <div>
          <ScooterMap
            scooters={scooters}
            stations={points.map((p, i) => ({ lat: p.lat, lng: p.lng, name: `Station ${i + 1}` }))}
            clusterAssignments={Object.keys(clusterAssignments).length > 0 ? clusterAssignments : undefined}
          />
        </div>
        <p className="mt-2 text-sm text-text-faded">
          {method === 'KMEANS' ? 'KMeans cluster centers shown on the map as stations.' : 'HDBSCAN cluster centers shown on the map as stations.'}
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