// src/componentss/PolesMap.tsx


import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';



// Define the shape of our API data
interface PoloData {
  polo: string;
  frequenciaAbsoluta: number;
  year: number;
  lat?: number;
  lng?: number;
}

const PolesMap = () => {
  const [poloData, setPoloData] = useState<PoloData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025); // Default to the latest year

  const [geoJSONData, setGeoJSONData] = useState(null);

  // Fetch the comprehensive data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/poles/comprehensive`);
        const data = await response.json();
        setPoloData(data);
      } catch (error) {
        console.error("Failed to fetch pole data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // The path is now relative to the root of your application, which is the public directory
    fetch('/ceara_municipios.geojson')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setGeoJSONData(data))
      .catch(error => console.error("Could not fetch GeoJSON data:", error));
  }, []);
  

  // Create a mapping of Polo Name -> Enrollment Count for the selected year for quick lookups
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    poloData
      .filter(p => p.year === selectedYear)
      .forEach(p => {
        map.set(p.polo.toUpperCase(), p.frequenciaAbsoluta);
      });
    return map;
  }, [poloData, selectedYear]);
  
  // A color scale function: more students = darker color
  const getColor = (count: number | undefined) => {
    if (count === undefined) return '#d3d3d3'; // Gray for no data
    return count > 1000 ? '#800026' :
           count > 500  ? '#BD0026' :
           count > 200  ? '#E31A1C' :
           count > 100  ? '#FC4E2A' :
           count > 50   ? '#FD8D3C' :
           count > 20   ? '#FEB24C' :
           count > 10   ? '#FED976' :
                          '#FFEDA0';
  };

  // This function styles each municipality based on its enrollment data
  const styleFeature = (feature: any) => {
    const poloName = feature.properties.NM_MUN.toUpperCase();
    const count = dataMap.get(poloName);
    return {
      fillColor: getColor(count),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };
  
  // This function adds interactivity (like hover effects) to each municipality
  const onEachFeature = (feature: any, layer: L.Layer) => {
    const poloName = feature.properties.NM_MUN;
    const count = dataMap.get(poloName.toUpperCase());
    const label = count !== undefined
      ? `${poloName}: ${count.toLocaleString()} matrículas em ${selectedYear}`
      : `${poloName}: Sem dados para ${selectedYear}`;
      
    layer.bindTooltip(label, {
      sticky: true,
      direction: 'auto',
      className: 'leaflet-tooltip-custom'
    });

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, color: '#666' });
      },
      mouseout: (e) => {
        e.target.setStyle({ weight: 1, color: 'white' });
      }
    });
  };
  
  // ✨  ADD THIS HELPER FUNCTION for dynamic marker color
  const getMarkerColor = (count: number) => {
    return count > 1000 ? '#800026' :
           count > 500  ? '#BD0026' :
           count > 200  ? '#E31A1C' :
           count > 100  ? '#FC4E2A' :
           count > 50   ? '#FD8D3C' :
           count > 20   ? '#FEB24C' :
           count > 10   ? '#FED976' :
                          '#FFEDA0';
  };

  // ✨  ADD THIS HELPER FUNCTION for dynamic marker size
  // We use a non-linear scale (log) to keep very large numbers from creating giant circles
  const getMarkerRadius = (count: number) => {
    if (count <= 0) return 0;
    return 10 + Math.log(count) * 2.5;
  };


  // Filter the data for the selected year and only include poles with coordinates
  const dataForSelectedYear = useMemo(() => 
    poloData.filter(p => p.year === selectedYear && p.lat && p.lng),
    [poloData, selectedYear]
  );


   // FIX: Wrap uniqueYears calculation in useMemo for performance
  const uniqueYears = useMemo(() => 
    [...new Set(poloData.map(p => p.year))].sort((a, b) => b - a),
    [poloData] // Only recalculate when the poloData changes
  );

  if (loading) {
    return <div className="text-center p-10">Carregando mapa...</div>;
  }

  return (
    <div className="h-[600px] w-full relative">
      {/* Year Selector for the Map */}
      <div className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded shadow-lg">
        <label htmlFor="year-select" className="block text-sm font-bold text-gray-700">Ano:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
        >
          {uniqueYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <MapContainer center={[-5.5, -39.5]} zoom={7} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {dataForSelectedYear.map(polo => {
          const radius = getMarkerRadius(polo.frequenciaAbsoluta);
          const size = radius * 2; // Diameter for the icon size

          return (

          <Marker
            key={polo.polo}
            position={[polo.lat!, polo.lng!]}
        
            // ✨ UPDATE the icon logic to be fully dynamic
              icon={L.divIcon({
                className: 'custom-bubble-marker',
                html: `<div style="background-color: ${getMarkerColor(polo.frequenciaAbsoluta)};" class="marker-circle"><span>${polo.frequenciaAbsoluta.toLocaleString()}</span></div>`,
                iconSize: [size, size],
                iconAnchor: [radius, radius],
              })}
          >
            <Tooltip>
              <b>{polo.polo}</b><br />{polo.frequenciaAbsoluta.toLocaleString()} matrículas
            </Tooltip>
          </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};


export default PolesMap;