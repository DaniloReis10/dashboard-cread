// src/components/Legend.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const getColor = (alunos) => {
  if (alunos > 10000) return '#800026';
  if (alunos > 5000) return '#BD0026';
  if (alunos > 2000) return '#E31A1C';
  if (alunos > 1000) return '#FC4E2A';
  if (alunos > 500) return '#FD8D3C';
  return '#FEB24C';
};

const Legend = () => {
  const map = useMap();

  useEffect(() => {
    const legend = L.control({ position: 'topright' });

    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      const grades = [0, 500, 1000, 2000, 5000, 10000];

      const labels = grades.map((from, i) => {
        const to = grades[i + 1];
        const color = getColor(from + 1);
        return `<div><i style="background:${color}"></i> ${from}${to ? '&ndash;' + to : '+'}</div>`;
      });

      div.innerHTML = `<h4>Alunos matriculados</h4>${labels.join('')}`;
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [map]);

  return null;
};

export default Legend;
