"use client";
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase 창고 직통 연결 (비밀 금고 우회!)
const supabaseUrl = 'https://sulnwwvrnzveywcqqbsp.supabase.co';
const supabaseKey = '여기에_긴_영어_출입증(ey로_시작하는것)_전체를_복사해서_넣어주세요';
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. 지도 부품 불러오기
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

// 3. 두 GPS 좌표 사이의 거리(km)를 정확히 계산하는 공식 (하버사인 공식)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ⏱️ 초시계 작동 (러닝 중일 때 1초마다 시간 증가)
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setDuration((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  // 🏃‍♂️ 러닝 시작 버튼 눌렀을 때
  const startRunning = () => {
    setIsRunning(true);
    setPath([]); setDistance(0); setDuration(0);

    if ("geolocation" in navigator) {
      // 내 위치 실시간 추적 시작!
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPos: [number, number] = [latitude, longitude];
          
          setPath((prevPath) => {
            if (prevPath.length > 0) {
              const lastPos = prevPath[prevPath.length - 1];
              const dist = getDistanceFromLatLonInKm(lastPos[0], lastPos[1], newPos[0], newPos[1]);
              setDistance((prev) => prev + dist); // 이동 거리 누적
            }
            return [...prevPath, newPos]; // 지도에 점 추가
          });
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 0 } // 최고 정확도 모드
      );
    } else {
      alert("GPS를 지원하지 않는 기기입니다.");
    }
  };

  // 🛑 러닝 종료 버튼 눌렀을 때
  const stopRunning = async () => {
    setIsRunning(false);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current); // 추적 끄기

    // 평균 페이스 계산
    const paceMinutes = distance > 0 ? (duration / 60) / distance : 0;
    const paceMin = Math.floor(paceMinutes);
    const paceSec = Math.floor((paceMinutes - paceMin) * 60);
    const paceString = distance > 0 ? `${paceMin}'${paceSec.toString().padStart(2, '0')}"` : "0'00\"";

    alert("러닝을 종료합니다. 기록을 창고로 보내는 중입니다...");

    // 🚀 Supabase 창고에 데이터 밀어넣기!
    const { error } = await supabase
      .from('running_records')
      .insert([{
          distance: parseFloat(distance.toFixed(2)),
          duration: duration,
          pace: paceString,
          route_data: JSON.stringify(path)
      }]);

    if (error) {
      alert("앗, 저장 실패: " + error.message);
    } else {
      alert("🎉 기록 저장 성공! Supabase를 확인해보세요!");
    }
  };

  // 초(Seconds)를 00:00 형태로 예쁘게 바꿔주는 함수
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Runner's Hi 🏃‍♂️</h1>
      
      {/* 거리와 시간 표시판 */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "28px", fontWeight: "bold", color: "#333" }}>
        <div>⏱️ {formatTime(duration)}</div>
        <div>📏 {distance.toFixed(2)} km</div>
      </div>

      <div style={{ borderRadius: "15px", overflow: "hidden", border: "2px solid #ddd", marginBottom: "20px" }}>
        <MapComponent path={path} />
      </div>
      
      {/* 상태에 따라 버튼 색상과 글자가 바뀝니다 */}
      {!isRunning ? (
        <button onClick={startRunning} style={{ 
          width: "100%", padding: "18px", backgroundColor: "#000", color: "#fff", 
          borderRadius: "10px", fontSize: "20px", fontWeight: "bold", cursor: "pointer", border: "none"
        }}>
          ▶ 러닝 시작하기
        </button>
      ) : (
        <button onClick={stopRunning} style={{ 
          width: "100%", padding: "18px", backgroundColor: "#ff3b30", color: "#fff", 
          borderRadius: "10px", fontSize: "20px", fontWeight: "bold", cursor: "pointer", border: "none"
        }}>
          ◼ 러닝 종료 및 저장
        </button>
      )}
    </div>
  );
}