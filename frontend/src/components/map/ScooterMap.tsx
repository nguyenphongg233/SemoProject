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
  [SCOOTER_STATUSES.AVAILABLE]: { color: '#00D1FF', fillColor: '#00D1FF' },
  [SCOOTER_STATUSES.IN_USE]: { color: '#0052FF', fillColor: '#0052FF' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#FF5C7A', fillColor: '#FF5C7A' },
}

const statusLabels: Record<string, string> = {
  [SCOOTER_STATUSES.AVAILABLE]: 'Available',
  [SCOOTER_STATUSES.IN_USE]: 'In Use',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
}

function resolveMarkerStyle(status: string) {
  return statusStyles[status] || { color: '#8BA0C7', fillColor: '#8BA0C7' }
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
      <MapContainer
        center={BACH_KHOA_CENTER}
        zoom={16}
        minZoom={8}
        maxZoom={18}
        maxBounds={NORTHERN_VIETNAM_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
        className="w-full h-130 rounded-[22px] overflow-hidden border border-(--border-strong) shadow-(--shadow-soft)"
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
            pathOptions={{
              color: '#6D5DFF',
              fillColor: '#6D5DFF',
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="grid gap-1.5 min-w-50 text-(--text)">
                <strong className="text-(--color-cyan-soft)">Selected Point</strong>
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
                  {station.name || `Station #${idx + 1}`}
                </Tooltip>
                <Popup>
                  <div className="grid gap-1.5 min-w-50 text-(--text)">
                    <strong className="text-(--color-cyan-soft)">{station.name || `Station #${idx + 1}`}</strong>
                    <p>Location: {formatCoordinates(station.lat, station.lng)}</p>
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
                {scooter.name ? `${scooter.name} — ID:${scooter.id}` : `ID:${scooter.id}`}
              </Tooltip>
              <Popup>
                <div className="grid gap-1.5 min-w-50 text-(--text)">
                  <strong className="text-(--color-cyan-soft)">{scooter.name || `Scooter #${scooter.id}`}</strong>
                  <p>Status: {statusLabels[scooter.status] || scooter.status || '—'}</p>
                  <p>Battery: {formatBatteryLevel(scooter.batteryLevel) || '—'}</p>
                  <p>Location: {formatCoordinates(scooter.currentLat, scooter.currentLng) || '—'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="flex flex-wrap gap-10 text-xs text-(--text-muted)">
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#00D1FF] text-[rgba(0,209,255,0.5)]" /> Available
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#0052FF] text-[rgba(0,82,255,0.5)]" /> In Use
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#FF5C7A] text-[rgba(255,92,122,0.5)]" /> Maintenance
        </span>
      </div>

      {mappedScooters.length === 0 && (
        <div className="p-1 rounded-[14px] bg-[rgba(0,82,255,0.08)] border border-[rgba(0,82,255,0.22)] text-(--text-muted)">
          No scooters with coordinates available. Please add lat/lng in the scooter form to display them on the map.
        </div>
      )}
    </div>
  )
}