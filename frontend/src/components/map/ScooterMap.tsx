import { useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { CircleMarker, Circle, MapContainer, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import type { LeafletMouseEvent } from 'leaflet'

import { SCOOTER_STATUSES } from '@/constants'
import { formatBatteryLevel, formatCoordinates } from '@/utils'
import type { Scooter, LatLngPos, Station } from '@/types/models'

const BACH_KHOA_CENTER: [number, number] = [21.0052, 105.8433]
const NORTHERN_VIETNAM_BOUNDS: [[number, number], [number, number]] = [
  [17.95, 102.10],
  [23.75, 108.20],
]

const statusStyles: Record<string, { color: string; fillColor: string }> = {
  [SCOOTER_STATUSES.AVAILABLE]: { color: '#00D1FF', fillColor: '#00D1FF' },
  [SCOOTER_STATUSES.IN_USE]: { color: '#0052FF', fillColor: '#0052FF' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#FF5C7A', fillColor: '#FF5C7A' },
  [SCOOTER_STATUSES.CHARGING]: { color: '#FFB800', fillColor: '#FFB800' },
}

const statusLabels: Record<string, string> = {
  [SCOOTER_STATUSES.AVAILABLE]: 'Available',
  [SCOOTER_STATUSES.IN_USE]: 'In Use',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Maintenance',
  [SCOOTER_STATUSES.CHARGING]: 'Charging',
}

const CLUSTER_COLORS = [
  '#FF5C7A', // Red
  '#00D1FF', // Cyan
  '#FFB800', // Yellow
  '#6D5DFF', // Purple
  '#00E5A3', // Green
  '#FF8A00', // Orange
  '#FF00D6', // Pink
  '#0052FF', // Blue
  '#A0FF00', // Lime
]

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
  zones?: any[];
  previewRadius?: number;
  onMapClick?: (pos: LatLngPos) => void;
  clusterAssignments?: Record<number, number>;
}

export default function ScooterMap({ scooters = [], stations = [], zones = [], previewRadius, onMapClick, clusterAssignments }: ScooterMapProps) {
  const [preview, setPreview] = useState<LatLngPos | null>(null)
  
  const [visibleStatuses, setVisibleStatuses] = useState<Set<string>>(
    new Set(Object.values(SCOOTER_STATUSES))
  )

  const toggleStatus = (status: string) => {
    setVisibleStatuses(prev => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const mappedScooters = useMemo(
    () =>
      scooters.filter(
        (s) => s.currentLat !== null && s.currentLng !== null && Number.isFinite(Number(s.currentLat)) && Number.isFinite(Number(s.currentLng)) && visibleStatuses.has(s.status)
      ),
    [scooters, visibleStatuses],
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
          previewRadius ? (
            <Circle
              center={[preview.lat, preview.lng]}
              radius={previewRadius}
              pathOptions={{
                color: '#6D5DFF',
                fillColor: '#6D5DFF',
                fillOpacity: 0.3,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div className="grid gap-1.5 min-w-50 text-(--text)">
                  <strong className="text-cyan-soft">Geofence Preview</strong>
                  <div>{formatCoordinates(preview.lat, preview.lng)}</div>
                  <div>Radius: {previewRadius}m</div>
                </div>
              </Popup>
            </Circle>
          ) : (
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
                  <strong className="text-cyan-soft">Selected Point</strong>
                  <div>{formatCoordinates(preview.lat, preview.lng)}</div>
                </div>
              </Popup>
            </CircleMarker>
          )
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
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  {station.name || `Station #${idx + 1}`}
                </Tooltip>
                <Popup>
                  <div className="grid gap-1.5 min-w-50 text-(--text)">
                    <strong className="text-cyan-soft">{station.name || `Station #${idx + 1}`}</strong>
                    <p>Location: {formatCoordinates(station.lat, station.lng)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

        {mappedScooters.map((scooter) => {
          const lat = Number(scooter.currentLat)
          const lng = Number(scooter.currentLng)
          
          let color = '#8BA0C7';
          let fillColor = '#8BA0C7';

          if (clusterAssignments && clusterAssignments[Number(scooter.id)] !== undefined) {
            const cIdx = clusterAssignments[Number(scooter.id)];
            const paletteColor = CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length];
            color = paletteColor;
            fillColor = paletteColor;
          } else {
            const markerStyle = resolveMarkerStyle(scooter.status)
            color = markerStyle.color;
            fillColor = markerStyle.fillColor;
          }

          return (
            <CircleMarker
              key={scooter.id}
              center={[lat, lng]}
              radius={10}
              pathOptions={{
                color: color,
                fillColor: fillColor,
                fillOpacity: 0.85,
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                {scooter.name ? `${scooter.name} — ID:${scooter.id}` : `ID:${scooter.id}`}
              </Tooltip>
              <Popup>
                <div className="grid gap-1.5 min-w-50 text-(--text)">
                  <strong className="text-cyan-soft">{scooter.name || `Scooter #${scooter.id}`}</strong>
                  <p>Status: {statusLabels[scooter.status] || scooter.status || '—'}</p>
                  <p>Battery: {formatBatteryLevel(scooter.batteryLevel) || '—'}</p>
                  <p>Location: {formatCoordinates(scooter.currentLat, scooter.currentLng) || '—'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}

        {Array.isArray(zones) && zones.map((z, idx) => {
          const isActive = z.status === 'ACTIVE'
          const lat = Number(z.centerLat)
          const lng = Number(z.centerLng)
          
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
          
          return (
            <Circle
              key={`zone-${z.id || idx}`}
              center={[lat, lng]}
              radius={Number(z.radius)}
              pathOptions={{
                color: isActive ? '#00D1FF' : '#8BA0C7',
                fillColor: isActive ? '#00D1FF' : '#8BA0C7',
                fillOpacity: isActive ? 0.15 : 0.05,
                weight: 2,
                dashArray: isActive ? undefined : '5, 5'
              }}
            >
               <Tooltip direction="top" opacity={1}>
                 {z.name || `Zone #${z.id}`}
               </Tooltip>
               <Popup>
                 <div className="grid gap-1.5 min-w-50 text-(--text)">
                   <strong className="text-cyan-soft">{z.name || `Zone #${z.id}`}</strong>
                   <p>Status: {z.status}</p>
                   <p>Radius: {z.radius}m</p>
                 </div>
               </Popup>
            </Circle>
          )
        })}
      </MapContainer>

      <div className="flex flex-wrap gap-10 text-lg ml-4 text-text-muted">
        {!clusterAssignments ? (
          <>
            <button 
              onClick={() => toggleStatus(SCOOTER_STATUSES.AVAILABLE)}
              className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 ${!visibleStatuses.has(SCOOTER_STATUSES.AVAILABLE) ? 'opacity-40 grayscale' : ''}`}
            >
              <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#00D1FF] text-[rgba(0,209,255,0.5)]" /> Available
            </button>
            <button 
              onClick={() => toggleStatus(SCOOTER_STATUSES.IN_USE)}
              className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 ${!visibleStatuses.has(SCOOTER_STATUSES.IN_USE) ? 'opacity-40 grayscale' : ''}`}
            >
              <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#0052FF] text-[rgba(0,82,255,0.5)]" /> In Use
            </button>
            <button 
              onClick={() => toggleStatus(SCOOTER_STATUSES.MAINTENANCE)}
              className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 ${!visibleStatuses.has(SCOOTER_STATUSES.MAINTENANCE) ? 'opacity-40 grayscale' : ''}`}
            >
              <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-danger text-[rgba(255,92,122,0.5)]" /> Maintenance
            </button>
            <button 
              onClick={() => toggleStatus(SCOOTER_STATUSES.CHARGING)}
              className={`inline-flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80 ${!visibleStatuses.has(SCOOTER_STATUSES.CHARGING) ? 'opacity-40 grayscale' : ''}`}
            >
              <i className="w-3 h-3 rounded-full inline-block shadow-[0_0_8px_currentColor] bg-[#FFB800] text-[rgba(255,184,0,0.5)]" /> Charging
            </button>
          </>
        ) : (
          <span className="inline-flex items-center gap-2">
            <i>🎨</i> Scooters colored by nearest cluster center
          </span>
        )}
      </div>

      {mappedScooters.length === 0 && (
        <div className="p-6 rounded-lg bg-[rgba(0,82,255,0.08)] border border-[rgba(0,82,255,0.22)] text-text-muted">
          No scooters with coordinates available. Please add lat/lng in the scooter form to display them on the map.
        </div>
      )}
    </div>
  )
}