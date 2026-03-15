"use client";
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// path(경로) 데이터를 받아서 지도에 그려주는 부품으로 업그레이드 되었습니다!
export default function MapComponent({ path }: { path: [number, number][] }) {
  // 달린 기록이 있으면 가장 최근 위치를, 없으면 수원시청을 보여줍니다.
  const currentPos = path.length > 0 ? path[path.length - 1] : [37.2635, 127.0286];

  return (
    <MapContainer center={currentPos as any} zoom={16} style={{ height: "400px", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* 내가 지나온 길을 따라 빨간 궤적을 그립니다 */}
      <Polyline positions={path} color="red" weight={5} />
      
      {/* 현재 내 위치를 파란색 점으로 표시합니다 */}
      {path.length > 0 && (
        <CircleMarker center={currentPos as any} radius={8} color="white" fillColor="#007bff" fillOpacity={1} />
      )}
    </MapContainer>
  );
}