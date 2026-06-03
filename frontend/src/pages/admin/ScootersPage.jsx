import { useEffect, useMemo, useState } from 'react'
import { Bike, BatteryFull } from 'lucide-react'

import { SectionHeader } from '../../components/layout'
import ScooterMap from '../../components/map/ScooterMap'
import { Alert, Button, Card, Modal, Table, TextField } from '../../components/ui'
import { SCOOTER_STATUSES } from '../../constants/statuses'
import { createScooter, getAllScooters, updateScooter } from '../../features/scooters'
import { formatBatteryLevel, formatDateTime } from '../../utils/formatters'
import { getApiErrorMessage } from '../../utils/apiError'

const initialForm = {
  id: null,
  name: '',
  batteryLevel: 100,
  status: SCOOTER_STATUSES.AVAILABLE,
  currentLat: '',
  currentLng: '',
}

const statusMeta = {
  [SCOOTER_STATUSES.AVAILABLE]:   { label: 'Sẵn sàng',     className: 'is-available' },
  [SCOOTER_STATUSES.IN_USE]:      { label: 'Đang thuê',    className: 'is-in-use' },
  [SCOOTER_STATUSES.MAINTENANCE]: { label: 'Đang bảo trì', className: 'is-maintenance' },
}

function getStatusLabel(status) {
  return statusMeta[status]?.label || status || 'Không xác định'
}
function getStatusClassName(status) {
  return statusMeta[status]?.className || 'is-unknown'
}

export default function ScootersPage() {
  const [scooters, setScooters] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [selectedScooterId, setSelectedScooterId] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('id_asc')

  useEffect(() => {
    let mounted = true
    async function loadScooters() {
      try {
        setError('')
        const data = await getAllScooters()
        if (mounted) {
          setScooters(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err, 'Lỗi: Không thể tải dữ liệu xe.'))
      }
    }

    loadScooters()
    const intervalId = setInterval(loadScooters, 5000)
    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [])

  const summary = useMemo(() => {
    const total = scooters.length
    const available = scooters.filter((item) => item.status === SCOOTER_STATUSES.AVAILABLE).length
    const inUse = scooters.filter((item) => item.status === SCOOTER_STATUSES.IN_USE).length
    const maintenance = scooters.filter((item) => item.status === SCOOTER_STATUSES.MAINTENANCE).length

    return [
      { label: 'Tổng số xe', value: total },
      { label: 'Sẵn sàng', value: available },
      { label: 'Đang phục vụ', value: inUse },
      { label: 'Đang bảo trì', value: maintenance },
    ]
  }, [scooters])

  const smartSchedulingScooters = useMemo(() => {
    return [...scooters]
      .filter(item => item.status !== SCOOTER_STATUSES.IN_USE)
      .sort((a, b) => a.batteryLevel - b.batteryLevel);
  }, [scooters])

  const processedScooters = useMemo(() => {
    let result = scooters.filter((s) => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      const matchName = s.name && s.name.toLowerCase().includes(term)
      const matchId = s.id && s.id.toString().includes(term)
      return matchName || matchId
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case 'battery_desc': return b.batteryLevel - a.batteryLevel
        case 'battery_asc':  return a.batteryLevel - b.batteryLevel
        case 'status':       return a.status.localeCompare(b.status)
        case 'id_desc':      return b.id - a.id
        case 'id_asc':
        default:             return a.id - b.id
      }
    })

    return result
  }, [scooters, searchTerm, sortBy])

  const handleFindOnMap = (e, row) => {
    e.preventDefault();
    if (!row.currentLat || !row.currentLng) {
      alert("Hệ thống cảnh báo:\nChiếc xe này hiện chưa được gắn tọa độ GPS.\nVui lòng bấm 'Sửa' và gán tọa độ cho xe trước khi tìm kiếm!");
      return;
    }

    setSelectedScooterId(null);
    setTimeout(() => {
      setSelectedScooterId(row.id);
      const mapSection = document.getElementById('scooter-map-section');
      if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 10);
  }

  const columns = [
    {
      key: 'name',
      label: 'Tên xe',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bike size={16} strokeWidth={1.8} style={{ color: 'var(--color-cyan-soft, #38bdf8)' }} />
          {row.name ? `${row.name} (#${row.id})` : `Xe #${row.id}`}
        </span>
      )
    },
    {
      key: 'batteryLevel',
      label: 'Mức Pin',
      render: (row) => {
        const lvl = Number(row.batteryLevel)
        const tone = lvl >= 50 ? 'var(--success, #10b981)' : lvl >= 25 ? 'var(--warning, #f59e0b)' : 'var(--danger, #ef4444)'
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: tone, fontWeight: 600 }}>
            <BatteryFull size={16} strokeWidth={1.8} />
            {formatBatteryLevel(row.batteryLevel) || '—'}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <span className={`status-pill ${getStatusClassName(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      )
    },
    {
      key: 'location',
      label: 'Tọa độ GPS',
      render: (row) =>
        row.currentLat && row.currentLng ? `${Number(row.currentLat).toFixed(5)}, ${Number(row.currentLng).toFixed(5)}` : '-',
    },
    { key: 'updatedAt', label: 'Cập nhật', render: (row) => formatDateTime(row.updatedAt || row.createdAt) || '-' },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" onClick={() => openEdit(row)}>Sửa</Button>
          <Button type="button" variant="secondary" onClick={(e) => handleFindOnMap(e, row)}>📍 Tìm</Button>
        </div>
      ),
    },
  ]

  const smartColumns = [
    {
      key: 'name',
      label: 'Tên xe',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Bike size={16} strokeWidth={1.8} style={{ color: 'var(--color-cyan-soft, #38bdf8)' }} />
          {row.name ? `${row.name} (#${row.id})` : `Xe #${row.id}`}
        </span>
      )
    },
    {
      key: 'batteryLevel',
      label: 'Mức Pin',
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--danger, #ef4444)', fontWeight: 600 }}>
          <BatteryFull size={16} strokeWidth={1.8} />
          {formatBatteryLevel(row.batteryLevel) || '—'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row) => (
        <span className={`status-pill ${getStatusClassName(row.status)}`}>
          {getStatusLabel(row.status)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row) => (
        <div className="table-actions">
          <Button type="button" variant="secondary" onClick={(e) => handleFindOnMap(e, row)}>📍 Tìm</Button>
        </div>
      ),
    },
  ]

  function openCreate() {
    setForm(initialForm)
    setIsModalOpen(true)
  }

  function handleMapClick({ lat, lng }) {
    setForm((currentForm) => ({
      ...currentForm,
      currentLat: lat?.toFixed ? lat.toFixed(5) : lat,
      currentLng: lng?.toFixed ? lng.toFixed(5) : lng,
    }))
    setIsModalOpen(true)
  }

  function openEdit(row) {
    setForm({
      id: row.id,
      name: row.name || '',
      batteryLevel: row.batteryLevel ?? 100,
      status: row.status || SCOOTER_STATUSES.AVAILABLE,
      currentLat: row.currentLat ?? '',
      currentLng: row.currentLng ?? '',
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(event) {
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
      setError(getApiErrorMessage(err, 'Lỗi: Không thể lưu dữ liệu xe.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Quản trị viên"
        title="Quản lý Xe điện"
        description="Thêm, sửa thông tin phương tiện, theo dõi phần trăm pin và tọa độ GPS."
        actions={<Button onClick={openCreate}>+ Thêm xe mới</Button>}
      />

      <div className="stats-grid stats-grid--compact">
        {summary.map((item) => (
          <Card key={item.label}>
            <p className="stat-card__label">{item.label}</p>
            <div className="stat-card__value">{loading ? '—' : item.value}</div>
          </Card>
        ))}
      </div>

      {error && <Alert>{error}</Alert>}

      <SectionHeader
        title="Gợi ý thu hồi sạc"
        description="Hệ thống tự động lọc ra 5 xe đang cạn pin nhất để ưu tiên mang đi sạc."
      />
      <Card>
        <Table
          columns={smartColumns}
          rows={smartSchedulingScooters.slice(0, 5)}
          rowKey={(row) => `smart-${row.id}`}
          emptyMessage={loading ? 'Đang tải danh sách…' : 'Chưa có xe nào cần sạc.'}
        />
      </Card>

      <SectionHeader title="Bản đồ tổng thể" />
      <Card>
        <div id="scooter-map-section" style={{ height: 600 }}>
          <ScooterMap
            scooters={scooters}
            onMapClick={handleMapClick}
            selectedScooterId={selectedScooterId}
          />
        </div>
      </Card>

      <SectionHeader title="Danh sách Xe điện" />

      <Card>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <TextField
              label="🔍 Tìm kiếm nhanh"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Gõ tên hoặc ID xe..."
            />
          </div>
          <div style={{ minWidth: '220px', flex: '0 1 220px' }}>
            <label className="ui-field">
              <span className="ui-field__label">Sắp xếp theo</span>
              <select
                className="ui-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="id_asc">ID xe (Cũ nhất lên đầu)</option>
                <option value="id_desc">ID xe (Mới nhất lên đầu)</option>
                <option value="battery_desc">Mức Pin (Từ cao xuống thấp)</option>
                <option value="battery_asc">Mức Pin (Từ thấp lên cao)</option>
                <option value="status">Trạng thái (Sắp xếp A-Z)</option>
              </select>
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          rows={processedScooters}
          rowKey={(row) => row.id}
          emptyMessage={
            loading
              ? 'Đang tải danh sách…'
              : searchTerm
                ? 'Không tìm thấy xe nào phù hợp với từ khóa.'
                : 'Chưa có dữ liệu xe.'
          }
        />
      </Card>

      <Modal
        open={isModalOpen}
        title={form.id ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
            <Button type="submit" form="scooter-form" disabled={saving}>
              {saving ? 'Đang lưu…' : 'Lưu lại'}
            </Button>
          </div>
        }
      >
        <form id="scooter-form" className="form-grid" onSubmit={handleSubmit}>

          {/* NÚT LẤY TỌA ĐỘ BẢN ĐỒ ĐÃ ĐƯỢC TRẢ LẠI Ở ĐÂY VÀ GỌT SẠCH CHỮ */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
            <Button type="button" variant="secondary" onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(false);
                setTimeout(() => {
                  const mapSection = document.getElementById('scooter-map-section');
                  if (mapSection) mapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }}>
              🗺️ Lấy tọa độ từ Bản đồ
            </Button>
          </div>

          <TextField
            label="Tên phương tiện"
            name="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />

          <TextField
            label="Dung lượng Pin (%)"
            type="number"
            name="batteryLevel"
            min="0"
            max="100"
            value={form.batteryLevel}
            onChange={(event) => setForm((current) => ({ ...current, batteryLevel: event.target.value }))}
            required
          />

          <TextField
            label="Vĩ độ *"
            type="number"
            name="currentLat"
            step="0.00001"
            value={form.currentLat}
            onChange={(event) => setForm((current) => ({ ...current, currentLat: event.target.value }))}
            placeholder="Ví dụ: 21.00520"
            required
          />

          <TextField
            label="Kinh độ *"
            type="number"
            name="currentLng"
            step="0.00001"
            value={form.currentLng}
            onChange={(event) => setForm((current) => ({ ...current, currentLng: event.target.value }))}
            placeholder="Ví dụ: 105.84330"
            required
          />

          <label className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <span className="ui-field__label">Trạng thái hiện tại</span>
            <select
              className="ui-input"
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
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