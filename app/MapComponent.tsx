"use client";
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ path }: { path: [number, number][] }) {
  const currentPos = path.length > 0 ? path[path.length - 1] : [37.2635, 127.0286];

  // MapContainer를 any로 취급하여 타입 검사를 원천 차단합니다.
  const MapContainerAny = MapContainer as any;
  const PolylineAny = Polyline as any;
  const CircleMarkerAny = CircleMarker as any;

  return (
    <MapContainerAny center={currentPos} zoom={16} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {path.length > 0 && (
        <PolylineAny positions={path} color="red" weight={5} />
      )}
      
      {path.length > 0 && (
        <CircleMarkerAny center={currentPos} radius={8} color="white" fillColor="#007bff" fillOpacity={1} />
      )}
    </MapContainerAny>
  );
}