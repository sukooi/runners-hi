"use client";
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ path }) {
  const currentPos = path && path.length > 0 ? path[path.length - 1] : [37.2635, 127.0286];

  return (
    <MapContainer center={currentPos} zoom={16} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {path && path.length > 0 && (
        <Polyline positions={path} color="red" weight={5} />
      )}
      {path && path.length > 0 && (
        <CircleMarker center={currentPos} radius={8} color="white" fillColor="#007bff" fillOpacity={1} />
      )}
    </MapContainer>
  );
}