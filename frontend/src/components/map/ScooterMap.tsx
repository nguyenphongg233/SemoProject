import { useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'

import { SCOOTER_STATUSES } from '@/constants'
import { formatBatteryLevel, formatCoordinates } from '@/utils'
import type { Scooter, LatLngPos, Station } from '@/types/models'

const BACH_KHOA_CENTER: [number, number] = [21.0052, 105.8433]
const NORTHERN_VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [17.95, 102.10],
  [23.75, 108.20],
]

const statusLabels: Record<string, string> = {
  [SCOOTER_STATUSES.AVAILABLE]: 'Available',
  [SCOOTER_STATUSES.IN_USE]: 'In Use',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
}

interface MapClickHandlerProps {
  onClick?: (pos: LatLngPos) => void;
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  if (!onClick) return null
  useMapEvents({
    click(e: LeafletMouseEvent) {
      const { lat, lng } = e.latlng
      onClick?.({ lat, lng })
    },
  })
  return null
}

interface ScooterMapProps {
  scooters?: Scooter[];
  stations?: Station[];
  onMapClick?: (pos: LatLngPos) => void;
}

export default function ScooterMap({ scooters = [], stations = [], onMapClick }: ScooterMapProps) {
  const [preview, setPreview] = useState<LatLngPos | null>(null)

  const mappedScooters = useMemo(
    () =>
      scooters.filter(
        (s) => s.currentLat !== null && s.currentLng !== null && Number.isFinite(Number(s.currentLat)) && Number.isFinite(Number(s.currentLng)),
      ),
    [scooters],
  )

  return (
    <div className="relative grid gap-3">
      {/* CSS Injection để Leaflet tự nhận diện biến CSS cho các Marker */}
      <style>{`
        .marker-preview { color: #6D5DFF; fill: #6D5DFF; }
        .marker-station { color: var(--accent-color); fill: var(--accent-color); }
        
        /* Đồng bộ màu Scooter theo từng trạng thái bằng CSS Biến hóa */
        .marker-scooter-available { color: var(--accent-color); fill: var(--accent-color); }
        .marker-scooter-in-use { color: var(--brand); fill: var(--brand); }
        .marker-scooter-maintenance { color: var(--danger); fill: var(--danger); }
      `}</style>

      <MapContainer
        center={BACH_KHOA_CENTER}
        zoom={16}
        minZoom={8}
        maxZoom={18}
        maxBounds={NORTHERN_VIETNAM_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="w-full h-130 rounded-[22px] overflow-hidden border border-border-strong shadow-soft"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onMapClick && (
          <MapClickHandler
            onClick={(pos) => {
              setPreview(pos)
              onMapClick?.(pos)
            }}
          />
        )}

        {preview && onMapClick && (
          <CircleMarker
            center={[preview.lat, preview.lng]}
            radius={8}
            className="marker-preview"
            pathOptions={{ fillOpacity: 0.7, weight: 2 }}
          >
            <Popup>
              <div className="grid gap-1.5 min-w-50 text-text">
                <strong className="text-brand">Selected Point</strong>
                <div className="text-text-muted">{formatCoordinates(preview.lat, preview.lng)}</div>
              </div>
            </Popup>
          </CircleMarker>
        )}

        {Array.isArray(stations) &&
          stations
            .filter((s) => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng)))
            .map((station, idx) => (
              <CircleMarker
                key={`station-${idx}`}
                center={[Number(station.lat), Number(station.lng)]}
                radius={12}
                className="marker-station"
                pathOptions={{ fillOpacity: 0.6, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                  {station.name || `Station #${idx + 1}`}
                </Tooltip>
                <Popup>
                  <div className="grid gap-1.5 min-w-50 text-text">
                    <strong className="text-brand">{station.name || `Station #${idx + 1}`}</strong>
                    <p className="text-text-muted">Location: {formatCoordinates(station.lat, station.lng)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

        {mappedScooters.map((scooter) => {
          const lat = Number(scooter.currentLat)
          const lng = Number(scooter.currentLng)
          
          // Xác định class động dựa theo trạng thái xe
          let statusClass = 'marker-scooter-available'
          if (scooter.status === SCOOTER_STATUSES.IN_USE) statusClass = 'marker-scooter-in-use'
          if (scooter.status === SCOOTER_STATUSES.MAINTENANCE) statusClass = 'marker-scooter-maintenance'

          return (
            <CircleMarker
              key={scooter.id}
              center={[lat, lng]}
              radius={10}
              className={statusClass}
              pathOptions={{ fillOpacity: 0.85, weight: 2 }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                {scooter.name ? `${scooter.name} — ID:${scooter.id}` : `ID:${scooter.id}`}
              </Tooltip>
              <Popup>
                <div className="grid gap-1.5 min-w-50 text-text">
                  <strong className="text-brand">{scooter.name || `Scooter #${scooter.id}`}</strong>
                  <div className="space-y-0.5 text-sm text-text-muted">
                    <p>Status: <span className="text-text font-medium">{statusLabels[scooter.status] || scooter.status || '—'}</span></p>
                    <p>Battery: <span className="text-text font-medium">{formatBatteryLevel(scooter.batteryLevel) || '—'}</span></p>
                    <p>Location: <span className="text-text font-medium">{formatCoordinates(scooter.currentLat, scooter.currentLng) || '—'}</span></p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Chú thích bản đồ (Legend) thích ứng toàn diện */}
      <div className="flex flex-wrap gap-10 text-base ml-4 text-text-muted font-medium">
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block bg-accent-color shadow-glow-cyan" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block bg-brand shadow-glow-blue" /> In Use
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block bg-danger/90 dark:bg-danger shadow-[0_0_8px_rgba(220,38,38,0.4)] dark:shadow-[0_0_8px_rgba(255,92,122,0.5)]" /> Maintenance
        </span>
      </div>

      {/* Khối thông báo lỗi (Empty State) tự động đổi màu */}
      {mappedScooters.length === 0 && (
        <div className="p-6 rounded-lg bg-brand-soft border border-border-strong text-text-muted text-sm">
          No scooters with coordinates available. Please add lat/lng in the scooter form to display them on the map.
        </div>
      )}
    </div>
  )
}