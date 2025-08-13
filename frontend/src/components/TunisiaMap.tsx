import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression, LatLngTuple } from 'leaflet';
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
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const TunisiaMap: React.FC = () => {
  const defaultPosition: LatLngTuple = [36.8421, 10.1658]; // Approx Jardins d'El Menzah, Tunis
  const zoomLevel = 12;

  const hardcodedAgencies: Agency[] = [
    {
      nom: 'Comar Agence Jardins d\'El Menzah',
      adresse: 'Avenue Hédi Nouira, Jardins d\'El Menzah',
      latitude: 36.8421,
      longitude: 10.1658,
      page_url: '#',
    },
    {
      nom: 'Comar Agence Ennasr',
      adresse: 'Avenue Hédi Nouira, Ennasr 2',
      latitude: 36.8491,
      longitude: 10.1773,
      page_url: '#',
    },
    {
      nom: 'Comar Agence Ariana',
      adresse: 'Centre Urbain Nord, Ariana',
      latitude: 36.8665,
      longitude: 10.1809,
      page_url: '#',
    },
    {
      nom: 'Comar Agence Menzah 6',
      adresse: 'Rue 6001, El Menzah 6',
      latitude: 36.8312,
      longitude: 10.1563,
      page_url: '#',
    },
    {
      nom: 'Comar Agence Lafayette',
      adresse: 'Rue de Marseille, Tunis Lafayette',
      latitude: 36.8028,
      longitude: 10.1766,
      page_url: '#',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
<h3
  style={{
    fontSize: 15,
    fontWeight: 500,
    color: '#1f1f1f',
    textAlign: 'center',
  }}
>
  Trouvez l'agence Comar la plus proche en sélectionnant votre région sur la carte.
</h3>

      <div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
        <MapContainer
          center={defaultPosition}
          zoom={zoomLevel}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={defaultPosition} zoom={zoomLevel} />
          <TileLayer
            attribution='© OpenStreetMap'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {hardcodedAgencies.map((agency, i) => (
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
    </div>
  );
};

export default TunisiaMap;
