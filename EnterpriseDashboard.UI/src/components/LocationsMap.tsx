import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatCurrency } from '../utils/currency';

interface LocationsMapProps {
  locations: { label: string; uniqueName: string; value: number }[];
  onLocationClick: (data: any) => void;
}

// Coordinates map for Tunisian locations based on our dataset
const COORDINATES_MAP: Record<string, [number, number]> = {
  'Tunisia': [33.8869, 9.5375],
  'Tunis': [36.8065, 10.1815],
  'Ariana': [36.8625, 10.1956],
  'Sfax': [34.7406, 10.7603],
  'Sousse': [35.8254, 10.6369],
  'Tunis Headquarters': [36.8065, 10.1815],
  'Ariana Warehouse': [36.8625, 10.1956],
  'TechSolutions HQ': [36.8645, 10.1986], // Slightly offset to separate from Ariana Warehouse
  'Sfax Branch Office': [34.7406, 10.7603],
  'Sousse Warehouse': [35.8254, 10.6369],
};

// Component to handle dynamic map bounds/centering
const MapController = ({ locations }: { locations: LocationsMapProps['locations'] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations && locations.length > 0) {
      // Find all valid coordinates for the current locations
      const coords = locations
        .map(loc => COORDINATES_MAP[loc.label])
        .filter(Boolean) as [number, number][];

      if (coords.length > 0) {
        if (coords.length === 1) {
          // If only one point, center on it and zoom in
          map.setView(coords[0], 12, { animate: true });
        } else {
          // If multiple points, fit bounds to show all of them
          const lats = coords.map(c => c[0]);
          const lngs = coords.map(c => c[1]);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          map.fitBounds([
            [minLat, minLng],
            [maxLat, maxLng]
          ], { padding: [50, 50], maxZoom: 12, animate: true });
        }
      } else {
        // Fallback to Tunisia center
        map.setView([33.8869, 9.5375], 6, { animate: true });
      }
    }
  }, [locations, map]);

  return null;
};

export const LocationsMap: React.FC<LocationsMapProps> = ({ locations, onLocationClick }) => {
  // Find max value to calculate dynamic radius sizes
  const maxValue = locations.length > 0 ? Math.max(...locations.map(l => l.value)) : 1;

  // Function to calculate radius size based on relative value
  const getRadius = (value: number) => {
    const minRadius = 10;
    const maxRadius = 40;
    const percentage = value / maxValue;
    return minRadius + (percentage * (maxRadius - minRadius));
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative" style={{ zIndex: 0 }}>
      <MapContainer 
        center={[33.8869, 9.5375]} 
        zoom={6} 
        style={{ width: '100%', height: '100%', backgroundColor: '#1e293b' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController locations={locations} />

        {locations.map((loc) => {
          const coords = COORDINATES_MAP[loc.label];
          if (!coords) return null; // Skip if no coordinates exist for this location

          return (
            <CircleMarker
              key={loc.uniqueName}
              center={coords}
              radius={getRadius(loc.value)}
              fillColor="#14b8a6"
              fillOpacity={0.6}
              color="#0d9488"
              weight={2}
              eventHandlers={{
                click: () => {
                  onLocationClick({ 
                    label: loc.label, 
                    uniqueName: loc.uniqueName,
                    value: loc.value 
                  });
                },
                mouseover: (e) => {
                  e.target.setStyle({ fillOpacity: 0.9, color: '#fcd34d', weight: 3 });
                },
                mouseout: (e) => {
                  e.target.setStyle({ fillOpacity: 0.6, color: '#0d9488', weight: 2 });
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} className="bg-slate-800 border-slate-700 text-slate-200">
                <div className="p-1">
                  <p className="font-bold text-sm mb-1">{loc.label}</p>
                  <p className="text-teal-400 font-medium">Spend: {formatCurrency(loc.value)}</p>
                  <p className="text-xs text-slate-400 mt-1">Click to drill down</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
