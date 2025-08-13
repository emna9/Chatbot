import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue for TypeScript:
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

interface Agency {
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  page_url: string;
}

interface ChangeViewProps {
  center: LatLngExpression;
  zoom: number;
}

function ChangeView({ center, zoom }: ChangeViewProps) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const TunisiaMap: React.FC = () => {
  const defaultPosition: LatLngTuple = [34.5, 9.5];
  const zoomLevel = 8;

  const [userPosition, setUserPosition] = React.useState<LatLngTuple | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [agencies, setAgencies] = React.useState<Agency[]>([]);

  React.useEffect(() => {
    if (!navigator.geolocation) {
      const msg = "La géolocalisation n'est pas supportée par votre navigateur.";
      console.error(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    console.log("Obtaining user's position...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User's position obtained:", latitude, longitude);
        setUserPosition([latitude, longitude]);

        const url = `http://localhost:8000/nearby-agences?lat=${latitude}&lng=${longitude}&limit=5`;
        console.log("Fetching nearby agencies from:", url);

        fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
          })
          .then((data: Agency[]) => {
            console.log("Nearby agencies fetched:", data);
            setAgencies(data);
            setLoading(false);
          })
          .catch((err) => {
            const msg = "Erreur lors de la récupération des agences: " + err.message;
            console.error(msg);
            setError(msg);
            setLoading(false);
          });
      },
      (err) => {
        const msg = "Impossible d'obtenir votre position : " + err.message;
        console.error(msg);
        setError(msg);
        setLoading(false);
      }
    );
  }, []);

  return (
<div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
{error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Chargement...</div>}
      <MapContainer
        center={userPosition ?? defaultPosition}
        zoom={zoomLevel}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeView center={userPosition ?? defaultPosition} zoom={zoomLevel} />
        <TileLayer
          attribution='© OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
        )}

        {agencies.map((agency, i) => (
          <Marker key={i} position={[agency.latitude, agency.longitude]}>
            <Popup>
              <strong>{agency.nom}</strong><br />
              {agency.adresse}<br />
              <a href={agency.page_url} target="_blank" rel="noopener noreferrer">
                Plus de détails
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TunisiaMap;
