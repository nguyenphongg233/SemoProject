import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react'
import {
  SectionHeader,
  Button,
  Card,
  Table,
  Modal,
  TextField,
  Alert, DropdownMenu
} from '@/components'
import type { TableColumn } from '@/components/ui/Table'
import {
  getAllConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  type SystemConfig,
} from '@/features/system-config'
import { formatDateTime, getApiErrorMessage } from '@/utils'

interface DisplayConfig extends SystemConfig {
  isDefault?: boolean
}

const KNOWN_CONFIGS: DisplayConfig[] = [
  { key: 'BASE_PRICE', value: '5000', description: 'Giá thuê mỗi phút (VNĐ)', isDefault: true },
  { key: 'UNLOCK_FEE', value: '10000', description: 'Phí mở khóa xe lúc bắt đầu chuyến (VNĐ)', isDefault: true },
  { key: 'MIN_BALANCE', value: '20000', description: 'Số dư ví tối thiểu yêu cầu (VNĐ)', isDefault: true },
  { key: 'MAINTENANCE_THRESHOLD', value: '20', description: 'Ngưỡng phần trăm pin tự động bảo trì (%)', isDefault: true },
  { key: 'DISCOUNT_RATE', value: '0', description: 'Tỉ lệ giảm giá khuyến mãi (Ví dụ: 0.1 = 10%)', isDefault: true },
]

export default function SettingsPage() {
  const [configs, setConfigs] = useState<DisplayConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [isEditingDefault, setIsEditingDefault] = useState(false)
  
  // Form State
  const [formKey, setFormKey] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formDescription, setFormDescription] = useState('')
  
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    
    getAllConfigs()
      .then((data) => {
        if (!alive) return
        
        const apiMap = new Map<string, SystemConfig>()
        data.forEach(item => apiMap.set(item.key, item))
        
        const merged: DisplayConfig[] = KNOWN_CONFIGS.map(known => {
          if (apiMap.has(known.key)) {
            const apiCfg = apiMap.get(known.key)!
            apiMap.delete(known.key)
            return { ...apiCfg, isDefault: false }
          }
          return { ...known } // default fallback
        })
        
        // Custom configs remaining
        const customConfigs = Array.from(apiMap.values()).map(c => ({ ...c, isDefault: false }))
        setConfigs([...merged, ...customConfigs])
      })
      .catch((err) => {
        if (alive) setError(getApiErrorMessage(err, 'Failed to fetch system configurations.'))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [refreshKey])

  const openCreateModal = () => {
    setModalMode('create')
    setIsEditingDefault(false)
    setFormKey('')
    setFormValue('')
    setFormDescription('')
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (config: DisplayConfig) => {
    setModalMode('edit')
    setIsEditingDefault(!!config.isDefault)
    setFormKey(config.key)
    setFormValue(config.value)
    setFormDescription(config.description || '')
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formKey.trim() || !formValue.trim()) {
      setFormError('Key and Value are required.')
      return
    }

    setFormSaving(true)
    setFormError(null)

    try {
      // Nếu là tạo mới hoặc đang edit nhưng bản chất là Default (chưa có trong DB) -> gọi CREATE API
      if (modalMode === 'create' || isEditingDefault) {
        await createConfig({
          key: formKey.trim().toUpperCase(),
          value: formValue.trim(),
          description: formDescription.trim(),
        })
      } else {
        await updateConfig(formKey, {
          value: formValue.trim(),
          description: formDescription.trim(),
        })
      }
      setIsModalOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      setFormError(getApiErrorMessage(err, 'Failed to save configuration.'))
    } finally {
      setFormSaving(false)
    }
  }

  const handleDelete = async (row: DisplayConfig) => {
    if (row.isDefault) return // Cannot delete default ones from DB, they aren't there anyway
    if (!window.confirm(`Are you sure you want to delete configuration: ${row.key}?`)) return
    
    try {
      await deleteConfig(row.key)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      alert(getApiErrorMessage(err, 'Failed to delete configuration.'))
    }
  }

  const columns: TableColumn<DisplayConfig>[] = [
    {
      key: 'key',
      label: 'Config Key',
      render: (row) => <strong className="text-text-strong font-mono bg-surface p-1 rounded border border-border">{row.key}</strong>,
    },
    {
      key: 'value',
      label: 'Value',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-cyan-soft font-medium">{row.value}</span>
          {row.isDefault && <span className="text-xs text-text-faded italic mt-0.5">Chưa thiết lập (Dùng mặc định)</span>}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      render: (row) => row.updatedAt || row.createdAt ? formatDateTime(row.updatedAt) || formatDateTime(row.createdAt) : <span className="text-text-muted">—</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (row) => {
        const items = [
          { label: 'Edit', icon: <Edit2 size={14} />, onClick: () => openEditModal(row) }
        ];
        if (!row.isDefault) {
          items.push({ label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: () => handleDelete(row) });
        }
        return <DropdownMenu items={items} />;
      },
    },
  ]

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <SectionHeader
          eyebrow="System Configuration"
          title="Global Settings"
          description="Manage global parameters such as pricing, thresholds, and limits."
        />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setRefreshKey(k => k + 1)} leadingIcon={<RefreshCw size={18} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={openCreateModal} leadingIcon={<Plus size={18} />}>
            New Config
          </Button>
        </div>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <Card>
        {loading ? (
          <p className="text-text-muted">Loading configurations...</p>
        ) : (
          <Table<DisplayConfig>
            columns={columns}
            rows={configs}
            rowKey={(row) => row.key}
            emptyMessage="No system configurations found."
          />
        )}
      </Card>

      <Modal
        open={isModalOpen}
        onClose={() => !formSaving && setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New Configuration' : 'Edit Configuration'}
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={formSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={formSaving}>
              {formSaving ? 'Saving...' : 'Save Config'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="grid gap-4">
          {formError && <Alert tone="error">{formError}</Alert>}

          <TextField
            label="Key"
            value={formKey}
            onChange={(e) => setFormKey(e.target.value)}
            placeholder="e.g. BASE_PRICE"
            disabled={modalMode === 'edit'}
            required
            helpText={modalMode === 'edit' ? "Config keys cannot be changed after creation." : "Use UPPER_SNAKE_CASE for config keys."}
          />

          <TextField
            label="Value"
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="e.g. 5000"
            required
          />

          <TextField
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Brief description of what this config does"
          />
        </form>
      </Modal>
    </div>
  )
}
