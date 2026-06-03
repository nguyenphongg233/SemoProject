import { useEffect, useMemo, useState, useRef } from 'react'

import 'leaflet/dist/leaflet.css'
import { CircleMarker, Marker, MapContainer, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

import { SCOOTER_STATUSES } from '../../constants/statuses'
import { formatBatteryLevel, formatCoordinates } from '../../utils/formatters'

const BACH_KHOA_CENTER = [21.0052, 105.8433]
const NORTHERN_VIETNAM_BOUNDS = [
  [17.95, 102.10],
  [23.75, 108.20],
]

const statusStyles = {
  [SCOOTER_STATUSES.AVAILABLE]:   { color: '#00D1FF', fillColor: '#00D1FF' },
  [SCOOTER_STATUSES.IN_USE]:      { color: '#0052FF', fillColor: '#0052FF' },
  [SCOOTER_STATUSES.MAINTENANCE]: { color: '#FF5C7A', fillColor: '#FF5C7A' },
}

const statusLabels = {
  [SCOOTER_STATUSES.AVAILABLE]:   'Sẵn sàng',
  [SCOOTER_STATUSES.IN_USE]:      'Đang đi',
  [SCOOTER_STATUSES.MAINTENANCE]: 'Bảo trì',
}

function resolveMarkerStyle(status) {
  return statusStyles[status] || { color: '#8BA0C7', fillColor: '#8BA0C7' }
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

function MapRecenter({ stations }) {
  const map = useMap();
  useEffect(() => {
    if (stations && stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [Number(s.lat), Number(s.lng)]));
      if (bounds.isValid()) {
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5, maxZoom: 14 });
      }
    }
  }, [stations, map]);
  return null;
}

function MapRecenterToScooter({ scooters, selectedScooterId }) {
  const map = useMap();
  useEffect(() => {
    if (selectedScooterId) {
      const target = scooters.find(s => s.id === selectedScooterId);
      if (target && target.currentLat && target.currentLng) {
        map.flyTo([Number(target.currentLat), Number(target.currentLng)], 17, { duration: 1.2 });
      }
    }
  }, [selectedScooterId, scooters, map]);
  return null;
}

function MapRecenterToStation({ stations, selectedStationIndex }) {
  const map = useMap();
  useEffect(() => {
    if (selectedStationIndex !== null && stations[selectedStationIndex]) {
      const target = stations[selectedStationIndex];
      if (target && target.lat && target.lng) {
        map.flyTo([Number(target.lat), Number(target.lng)], 17, { duration: 1.2 });
      }
    }
  }, [selectedStationIndex, stations, map]);
  return null;
}

const createStationIcon = (isSelected) => {
  const size = isSelected ? 44 : 32;
  const border = isSelected ? '3px solid #FFFFFF' : '2px solid white';
  const glow = isSelected ? '0 0 20px #F59E0B, 0 0 10px #FFFFFF' : '0 0 15px #F59E0B';
  const fontSize = isSelected ? '24px' : '18px';

  return L.divIcon({
    className: 'custom-station-icon',
    html: `<div style="
      background: #F59E0B; border: ${border}; border-radius: 8px;
      width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;
      font-size: ${fontSize}; box-shadow: ${glow}; color: white;
      transition: all 0.3s ease;
    ">⚡</div>`,
    iconSize: [size, size], iconAnchor: [size/2, size], popupAnchor: [0, -size]
  });
};

const createScooterDotIcon = (color, isSelected) => {
  const size = isSelected ? 24 : 16;
  const border = isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255, 255, 255, 0.9)';
  const glow = isSelected ? `0 0 15px ${color}, 0 0 8px #FFFFFF` : `0 2px 4px rgba(0,0,0,0.5)`;

  return L.divIcon({
    className: 'custom-scooter-dot',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: ${border};
      border-radius: 50%;
      box-shadow: ${glow};
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

function SingleStationMarker({ station, isSelected, icon, index }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (isSelected && markerRef.current) markerRef.current.openPopup();
  }, [isSelected]);
  return (
    <Marker position={[Number(station.lat), Number(station.lng)]} icon={icon} ref={markerRef} zIndexOffset={isSelected ? 1000 : 0}>
      <Tooltip direction="top" offset={[0, isSelected ? -46 : -34]} opacity={1} permanent={isSelected}>
        {station.name || `Trạm ${index + 1}`}
      </Tooltip>
      <Popup>
        <div className="scooter-map__popup">
          <strong style={{ color: '#F59E0B' }}>⚡ {station.name || `Trạm ${index + 1}`}</strong>
          <p>Trạm sạc đề xuất </p>
          <p>Tọa độ: {formatCoordinates(station.lat, station.lng)}</p>
        </div>
      </Popup>
    </Marker>
  )
}

function SingleScooterMarker({ scooter, isSelected, icon }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (isSelected && markerRef.current) markerRef.current.openPopup();
  }, [isSelected]);
  return (
    <Marker position={[Number(scooter.currentLat), Number(scooter.currentLng)]} icon={icon} ref={markerRef} zIndexOffset={isSelected ? 1000 : 0}>
      <Tooltip direction="top" offset={[0, isSelected ? -16 : -12]} opacity={1} permanent={isSelected}>
        {scooter.name ? `${scooter.name} (#${scooter.id})` : `Xe #${scooter.id}`}
      </Tooltip>
      <Popup>
        <div className="scooter-map__popup">
          <strong>{scooter.name ? `${scooter.name} (#${scooter.id})` : `Xe #${scooter.id}`}</strong>
          <p>Trạng thái: {statusLabels[scooter.status] || scooter.status || '—'}</p>
          <p>Pin: {formatBatteryLevel(scooter.batteryLevel) || '—'}</p>
          <p>Tọa độ: {formatCoordinates(scooter.currentLat, scooter.currentLng) || '—'}</p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function ScooterMap({ scooters = [], stations = [], onMapClick, selectedScooterId = null, selectedStationIndex = null }) {
  const [preview, setPreview] = useState(null)
  const mappedScooters = useMemo(() => scooters.filter((s) => Number.isFinite(Number(s.currentLat)) && Number.isFinite(Number(s.currentLng))), [scooters])

  return (
    // BAO TOÀN BỘ BẢN ĐỒ VÀ CHÚ THÍCH VÀO 1 KHUNG CÓ BO GÓC CHUẨN XÁC
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

      {/* KHU VỰC BẢN ĐỒ */}
      <div style={{ flex: '1 1 auto', minHeight: '360px', position: 'relative' }}>
        <MapContainer
          center={BACH_KHOA_CENTER} zoom={16} minZoom={8} maxZoom={18}
          maxBounds={NORTHERN_VIETNAM_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onClick={(pos) => { setPreview(pos); onMapClick?.(pos) }} />
          <MapRecenter stations={stations} />
          <MapRecenterToScooter scooters={scooters} selectedScooterId={selectedScooterId} />
          <MapRecenterToStation stations={stations} selectedStationIndex={selectedStationIndex} />

          {preview && (
            <CircleMarker center={[preview.lat, preview.lng]} radius={8} pathOptions={{ color: '#6D5DFF', fillColor: '#6D5DFF', fillOpacity: 0.7, weight: 2 }}>
              <Popup>
                <div className="scooter-map__popup">
                  <strong>Điểm vừa click</strong>
                  <div>{formatCoordinates(preview.lat, preview.lng)}</div>
                </div>
              </Popup>
            </CircleMarker>
          )}

          {Array.isArray(stations) && stations.filter((s) => Number.isFinite(Number(s.lat)) && Number.isFinite(Number(s.lng))).map((station, idx) => {
            const isSelected = idx === selectedStationIndex;
            return <SingleStationMarker key={`station-${idx}`} station={station} index={idx} isSelected={isSelected} icon={createStationIcon(isSelected)} />
          })}

          {mappedScooters.map((scooter) => {
            const isSelected = scooter.id === selectedScooterId;
            const markerColor = resolveMarkerStyle(scooter.status).fillColor;
            return <SingleScooterMarker key={scooter.id} scooter={scooter} isSelected={isSelected} icon={createScooterDotIcon(markerColor, isSelected)} />
          })}
        </MapContainer>
      </div>

      {/* KHU VỰC CHÚ THÍCH (Y HỆT ẢNH CỦA BẠN LINH) */}
      <div style={{
        display: 'flex',
        gap: '24px',
        padding: '16px 20px',
        backgroundColor: '#0f172a', // Màu nền Dark Navy
        alignItems: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '15px' }}>
          <i style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00D1FF', boxShadow: '0 0 12px #00D1FF' }} />
          Sẵn sàng
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '15px' }}>
          <i style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0052FF', boxShadow: '0 0 12px #0052FF' }} />
          Đang đi
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '15px' }}>
          <i style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#FF5C7A', boxShadow: '0 0 12px #FF5C7A' }} />
          Bảo trì
        </span>
      </div>

    </div>
  )
}