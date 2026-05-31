// Real map view for plotting scooter positions around Bach Khoa.
import { useMemo, useState } from 'react'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'

import { SCOOTER_STATUSES } from '../../constants/statuses'
import { formatBatteryLevel, formatCoordinates } from '../../utils/formatters'

const BACH_KHOA_CENTER = [21.0052, 105.8433]
const NORTHERN_VIETNAM_BOUNDS = [
  [17.95, 102.10],
  [23.75, 108.20],
]

const statusStyles = {
  [SCOOTER_STATUSES.AVAILABLE]: { color: '#1f6f78', fillColor: '#1f6f78' },
  [SCOOTER_STATUSES.IN_USE]: { color: '#d38a15', fillColor: '#d38a15' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#c53939', fillColor: '#c53939' },
}

function resolveMarkerStyle(status) {
  return statusStyles[status] || { color: '#4f5d6b', fillColor: '#4f5d6b' }
}

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onClick?.({ lat, lng })
    },
  })

  return null
}

export default function ScooterMap({ scooters = [], stations = [], onMapClick }) {
  const [preview, setPreview] = useState(null)
  const mappedScooters = useMemo(
    () =>
      scooters.filter((scooter) => Number.isFinite(Number(scooter.currentLat)) && Number.isFinite(Number(scooter.currentLng))),
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

        {/* Click handler to notify parent and show a preview marker */}
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
            pathOptions={{ color: '#1555ff', fillColor: '#1555ff', fillOpacity: 0.6, weight: 2 }}
          >
            <Popup>
              <div>
                <strong>New scooter here</strong>
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
                pathOptions={{ color: '#2b9cff', fillColor: '#2b9cff', fillOpacity: 0.6, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent>
                  {station.name || `Station ${idx + 1}`}
                </Tooltip>
                <Popup>
                  <div>
                    <strong>{station.name || `Station ${idx + 1}`}</strong>
                    <p>Position: {formatCoordinates(station.lat, station.lng)}</p>
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
                  <strong>{scooter.name || `Scooter #${scooter.id}`}</strong>
                  <p>Status: {scooter.status || '-'}</p>
                  <p>Battery: {formatBatteryLevel(scooter.batteryLevel) || '-'}</p>
                  <p>Position: {formatCoordinates(scooter.currentLat, scooter.currentLng) || '-'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      <div className="scooter-map__legend">
        <span><i className="scooter-map__swatch scooter-map__swatch--available" /> Available</span>
        <span><i className="scooter-map__swatch scooter-map__swatch--in-use" /> In use</span>
        <span><i className="scooter-map__swatch scooter-map__swatch--maintenance" /> Maintenance</span>
      </div>

      {mappedScooters.length === 0 && (
        <div className="scooter-map__empty">
          No scooters have coordinates yet. Add lat/lng in the scooter form to show them on the map.
        </div>
      )}
    </div>
  )
}