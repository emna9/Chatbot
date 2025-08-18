import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
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
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const TunisiaMap: React.FC = () => {
  const defaultPosition: LatLngTuple = [34.5, 9.5];
  const zoomLevel = 8;

  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [agencies, setAgencies] = useState<Agency[]>([]);

  // Create a ref to the map
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);

        fetch(`http://localhost:8000/nearby-agences?lat=${latitude}&lng=${longitude}&limit=5`)
          .then(res => res.json())
          .then((data: Agency[]) => {
            setAgencies(data);
            setLoading(false);
          })
          .catch(err => {
            setError("Erreur lors de la récupération des agences: " + err.message);
            setLoading(false);
          });
      },
      (err) => {
        setError("Impossible d'obtenir votre position : " + err.message);
        setLoading(false);
      }
    );
  }, []);

  // When the map ref is ready, fix gray tiles
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, [userPosition, agencies]);

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Chargement...</div>}

      <MapContainer
        center={userPosition ?? defaultPosition}
        zoom={zoomLevel}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef} // <-- assign ref here
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
