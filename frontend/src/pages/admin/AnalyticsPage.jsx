import { useState, useMemo } from 'react'

import { SectionHeader } from '../../components/layout'
import { Alert, Button, Card, Table, TextField } from '../../components/ui'
import ScooterMap from '../../components/map/ScooterMap'
import { getAllScooters } from '../../features/scooters'
import { getOptimalStations } from '../../features/analytics'
import { getApiErrorMessage } from '../../utils/apiError'

export default function AnalyticsPage() {
  const [k, setK] = useState(3)
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scooters, setScooters] = useState([])

  const [selectedStationIndex, setSelectedStationIndex] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSelectedStationIndex(null)

    try {
      const [data, scootersData] = await Promise.all([getOptimalStations(Number(k)), getAllScooters()])
      setPoints(Array.isArray(data) ? data : [])
      setScooters(Array.isArray(scootersData) ? scootersData : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Lỗi hệ thống: Không thể tính toán tọa độ trạm sạc'))
      setPoints([])
    } finally {
      setLoading(false)
    }
  }

  const mapStations = useMemo(() => {
    return points.map((p, i) => ({ lat: p.lat, lng: p.lng, name: `Trạm ${i + 1}` }))
  }, [points])

  const handleFindStation = (e, row) => {
    e.preventDefault();
    const realIndex = points.indexOf(row);

    setSelectedStationIndex(null);
    setTimeout(() => {
      setSelectedStationIndex(realIndex);
      const mapSection = document.getElementById('analytics-map-section');
      if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }

  const columns = [
    {
      key: 'name',
      label: 'Trạm sạc',
      render: (row) => <strong style={{ color: '#F59E0B' }}>⚡ Trạm {points.indexOf(row) + 1}</strong>
    },
    { key: 'lat', label: 'Vĩ độ' },
    { key: 'lng', label: 'Kinh độ' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="table-actions">
          <Button type="button" variant="secondary" onClick={(e) => handleFindStation(e, row)}>
            📍 Tìm trên Bản đồ
          </Button>
        </div>
      )
    },
  ]

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Quản trị viên"
        title="Thống kê & Phân tích"
        description="Đề xuất vị trí tối ưu để đặt trạm sạc dựa trên thuật toán K-Means Clustering."
      />

      {error && <Alert>{error}</Alert>}

      <Card>
        <form className="analytics-form" onSubmit={handleSubmit}>
          <TextField
            label="Số lượng trạm sạc (K)"
            type="number"
            min="1"
            max="20"
            name="k"
            value={k}
            onChange={(event) => setK(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Tính toán vị trí'}
          </Button>
        </form>
      </Card>

      <SectionHeader title="Bản đồ trạm sạc đề xuất" />
      <Card>
        <div id="analytics-map-section" style={{ height: 600 }}>
          <ScooterMap
            scooters={scooters}
            stations={mapStations}
            selectedStationIndex={selectedStationIndex}
          />
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={points}
          rowKey={(row, index) => `${row.lat}-${row.lng}-${index}`}
          emptyMessage="Chưa có dữ liệu trạm sạc. Vui lòng bấm 'Tính toán vị trí'."
        />
      </Card>
    </div>
  )
}