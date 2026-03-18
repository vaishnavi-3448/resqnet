import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const priorityColor = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444'
}

const typeEmoji = {
  food: '🍱', water: '💧', medical: '🏥',
  shelter: '🏠', rescue: '🚁', other: '📦'
}

const RequestMap = ({ requests, onClaim }) => {
  const defaultCenter = [13.0827, 80.2707] // Chennai

  const getCustomIcon = (priority) => {
    return L.divIcon({
      className: '',
      html: `<div style="
        background-color: ${priorityColor[priority]};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    })
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      style={{ height: '450px', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {requests.map((req) => (
        <Marker
          key={req._id}
          position={[
            req.location.coordinates[1], // latitude
            req.location.coordinates[0]  // longitude
          ]}
          icon={getCustomIcon(req.priority)}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                {typeEmoji[req.type]} {req.type.toUpperCase()}
              </p>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '4px' }}>
                {req.description}
              </p>
              <p style={{ fontSize: '12px', marginBottom: '4px' }}>
                👥 {req.peopleCount} people
              </p>
              <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                👤 {req.victim?.name} — {req.victim?.phone}
              </p>
              <button
                onClick={() => onClaim(req._id)}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                ✋ Claim Request
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default RequestMap