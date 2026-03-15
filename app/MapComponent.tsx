"use client";
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ path }: { path: [number, number][] }) {
  const currentPos = path.length > 0 ? path[path.length - 1] : [37.2635, 127.0286];

  return (
    // @ts-ignore
    <MapContainer center={currentPos} zoom={16} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* @ts-ignore */}
      <Polyline positions={path} color="red" weight={5} />
      {path.length > 0 && (
        // @ts-ignore
        <CircleMarker center={currentPos} radius={8} color="white" fillColor="#007bff" fillOpacity={1} />
      )}
    </MapContainer>
  );
}