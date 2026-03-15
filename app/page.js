"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 직접 연결 (대표님 고유 정보 입력 완료)
const supabaseUrl = 'https://sulnwwvrnzveywcqqbsp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdWJud3d2cm56dmV5d2NxcWJzcCIsInN1YiI6ImI1Z3d3d3Zybnp2ZXl3Y3FxYnNwIiwiaWF0IjoxNzAzMzk3FXYnNlWiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzNmNzAzMTM3QslmV4cCI6MjA4NjcxNjA4OTE5OD8a0GZ7uB6i5BOuFoQXo5M4PHW8ENA25zt-julqk';
const supabase = createClient(supabaseUrl, supabaseKey);

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const startRunning = () => {
    setIsRunning(true);
    setPath([]); setDistance(0); setDuration(0);
    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos = [latitude, longitude];
          setPath((prevPath) => {
            if (prevPath.length > 0) {
              const lastPos = prevPath[prevPath.length - 1];
              const dist = getDistanceFromLatLonInKm(lastPos[0], lastPos[1], newPos[0], newPos[1]);
              setDistance((prev) => prev + dist);
            }
            return [...prevPath, newPos];
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
  };

  const stopRunning = async () => {
    setIsRunning(false);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    const paceMinutes = distance > 0 ? (duration / 60) / distance : 0;
    const paceMin = Math.floor(paceMinutes);
    const paceSec = Math.floor((paceMinutes - paceMin) * 60);
    const paceString = distance > 0 ? `${paceMin}'${paceSec.toString().padStart(2, '0')}"` : "0'00\"";

    const { error } = await supabase
      .from('running_records')
      .insert([{
          distance: parseFloat(distance.toFixed(2)),
          duration: duration,
          pace: paceString,
          route_data: JSON.stringify(path)
      }]);

    if (error) alert("저장 실패: " + error.message);
    else alert("🎉 기록 저장 성공!");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>Runner's Hi 🏃‍♂️</h1>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "24px" }}>
        <div>⏱️ {formatTime(duration)}</div>
        <div>📏 {distance.toFixed(2)} km</div>
      </div>
      <div style={{ height: "400px", marginBottom: "20px" }}>
        <MapComponent path={path} />
      </div>
      <button onClick={isRunning ? stopRunning : startRunning} style={{ 
        width: "100%", padding: "15px", backgroundColor: isRunning ? "red" : "black", color: "white", borderRadius: "10px"
      }}>
        {isRunning ? "러닝 종료 및 저장" : "러닝 시작하기"}
      </button>
    </div>
  );
}