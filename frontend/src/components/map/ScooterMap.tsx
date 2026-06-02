import { useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'

import { SCOOTER_STATUSES } from '../../constants/statuses'
import { formatBatteryLevel, formatCoordinates } from '../../utils/formatters'
import type { Scooter, LatLngPos, Station } from '../../types/models'

const BACH_KHOA_CENTER: [number, number] = [21.0052, 105.8433]
const NORTHERN_VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [17.95, 102.10],
  [23.75, 108.20],
]

const statusStyles: Record<string, { color: string; fillColor: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]:   { color: '#00D1FF', fillColor: '#00D1FF' },
  [SCOOTER_STATUSES.IN_USE]:      { color: '#0052FF', fillColor: '#0052FF' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#FF5C7A', fillColor: '#FF5C7A' },
}

const statusLabels: Record<string, string> = {
  [SCOOTER_STATUSES.AVAILABLE]:   'Sẵn sàng',
  [SCOOTER_STATUSES.IN_USE]:      'Đang đi',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Bảo trì',
}

function resolveMarkerStyle(status: string) {
  return statusStyles[status] || { color: '#8BA0C7', fillColor: '#8BA0C7' }
}

interface MapClickHandlerProps {
  onClick?: (pos: LatLngPos) => void;
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      const { lat, lng } = e.latlng
      onClick?.({ lat, lng })
    },
  })
  return null
}

// Định nghĩa Props cho ScooterMap
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
    <div className="scooter-map">
      <MapContainer
        center={BACH_KHOA_CENTER}
        zoom={16}
        minZoom={8}
        maxZoom={18}
        maxBounds={NORTHERN_VIETNAM_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="scooter-map__canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onClick={(pos) => {
            setPreview(pos)
            onMapClick?.(pos)
          }}
        />

        {preview && (
          <CircleMarker
            center={[preview.lat, preview.lng]}
            radius={8}
            pathOptions={{
              color: '#6D5DFF',
              fillColor: '#6D5DFF',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="scooter-map__popup">
                <strong>Điểm vừa chọn</strong>
                <div>{formatCoordinates(preview.lat, preview.lng)}</div>
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
                pathOptions={{
                  color: '#38ddff',
                  fillColor: '#38ddff',
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                  {station.name || `Trạm ${idx + 1}`}
                </Tooltip>
                <Popup>
                  <div className="scooter-map__popup">
                    <strong>{station.name || `Trạm ${idx + 1}`}</strong>
                    <p>Vị trí: {formatCoordinates(station.lat, station.lng)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

        {mappedScooters.map((scooter) => {
          const lat = Number(scooter.currentLat)
          const lng = Number(scooter.currentLng)
          const markerStyle = resolveMarkerStyle(scooter.status)

          return (
            <CircleMarker
              key={scooter.id}
              center={[lat, lng]}
              radius={10}
              pathOptions={{
                color: markerStyle.color,
                fillColor: markerStyle.fillColor,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                {scooter.name || `#${scooter.id}`}
              </Tooltip>
              <Popup>
                <div className="scooter-map__popup">
                  <strong>{scooter.name || `Xe #${scooter.id}`}</strong>
                  <p>Trạng thái: {statusLabels[scooter.status] || scooter.status || '—'}</p>
                  <p>Pin: {formatBatteryLevel(scooter.batteryLevel) || '—'}</p>
                  <p>Vị trí: {formatCoordinates(scooter.currentLat, scooter.currentLng) || '—'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="scooter-map__legend">
        <span><i className="scooter-map__swatch scooter-map__swatch--available" /> Sẵn sàng</span>
        <span><i className="scooter-map__swatch scooter-map__swatch--in-use" /> Đang đi</span>
        <span><i className="scooter-map__swatch scooter-map__swatch--maintenance" /> Bảo trì</span>
      </div>

      {mappedScooters.length === 0 && (
        <div className="scooter-map__empty">
          Chưa có xe nào có toạ độ. Hãy bổ sung lat/lng trong form xe để hiển thị trên bản đồ.
        </div>
      )}
    </div>
  )
}