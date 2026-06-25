import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CourseMap from './CourseMap';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

// ─── Module-level SDK state (persists across re-mounts / StrictMode cycles) ───
let sdkPhase = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'
const waiters = [];

function loadKakaoSdk() {
  return new Promise((resolve, reject) => {
    if (sdkPhase === 'ready') { resolve(); return; }
    if (sdkPhase === 'error') { reject(new Error('Kakao Maps SDK load failed')); return; }

    waiters.push({ resolve, reject });
    if (sdkPhase === 'loading') return;

    // Already injected on a previous navigation (SPA)
    if (window.kakao?.maps?.Map) {
      sdkPhase = 'ready';
      flush('ready');
      return;
    }

    sdkPhase = 'loading';
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      try {
        window.kakao.maps.load(() => { sdkPhase = 'ready'; flush('ready'); });
      } catch (e) {
        sdkPhase = 'error'; flush('error');
      }
    };
    script.onerror = () => { sdkPhase = 'error'; flush('error'); };
    document.head.appendChild(script);
  });
}

function flush(phase) {
  waiters.splice(0).forEach(({ resolve, reject }) =>
    phase === 'ready' ? resolve() : reject(new Error('Kakao Maps SDK load failed')),
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function markerHtml(label, color, size = 28, glowColor = '') {
  const glow = glowColor
    ? `box-shadow:0 0 0 5px ${glowColor},0 2px 10px rgba(0,0,0,0.35);`
    : 'box-shadow:0 2px 8px rgba(0,0,0,0.35);';
  return (
    `<div style="` +
    `width:${size}px;height:${size}px;border-radius:50%;` +
    `background:${color};color:#fff;border:2px solid #fff;` +
    `display:flex;align-items:center;justify-content:center;` +
    `font-size:${size < 30 ? 10 : 11}px;font-weight:800;` +
    `${glow}cursor:default;">${label}</div>`
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function KakaoCourseMap({
  spots = [],
  activeSpotId = null,
  completedSpotIds = [],
  userLocation = null,
  height = 260,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const polylineRef = useRef(null);

  const [phase, setPhase] = useState(() => sdkPhase);

  // Load SDK once
  useEffect(() => {
    if (sdkPhase === 'ready') { setPhase('ready'); return; }
    if (sdkPhase === 'error') { setPhase('error'); return; }

    let cancelled = false;
    loadKakaoSdk()
      .then(() => { if (!cancelled) setPhase('ready'); })
      .catch(() => { if (!cancelled) setPhase('error'); });

    return () => { cancelled = true; };
  }, []);

  // Initialize / refresh map whenever SDK or data changes
  useEffect(() => {
    if (phase !== 'ready' || !containerRef.current) return;

    const kakao = window.kakao;
    const validSpots = spots.filter(
      (s) => s.lat != null && s.lng != null && !Number.isNaN(Number(s.lat)) && !Number.isNaN(Number(s.lng)),
    );
    if (validSpots.length === 0) return;

    // Create map only once per container
    if (!mapRef.current) {
      mapRef.current = new kakao.maps.Map(containerRef.current, {
        center: new kakao.maps.LatLng(validSpots[0].lat, validSpots[0].lng),
        level: 5,
      });
    }

    // Clear existing overlays / polyline
    overlaysRef.current.forEach((o) => { try { o.setMap(null); } catch {} });
    overlaysRef.current = [];
    if (polylineRef.current) { try { polylineRef.current.setMap(null); } catch {} polylineRef.current = null; }

    const map = mapRef.current;
    const bounds = new kakao.maps.LatLngBounds();

    // Spot markers
    validSpots.forEach((spot, i) => {
      const pos = new kakao.maps.LatLng(Number(spot.lat), Number(spot.lng));
      bounds.extend(pos);

      const isActive = spot.id === activeSpotId;
      const isCompleted = completedSpotIds.includes(spot.id);
      const color = isCompleted ? '#2563eb' : isActive ? '#0f8b6d' : '#13315c';
      const glow = isActive ? 'rgba(15,139,109,0.28)' : '';
      const size = isActive ? 32 : 28;

      const overlay = new kakao.maps.CustomOverlay({
        position: pos,
        content: markerHtml(i + 1, color, size, glow),
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: isActive ? 4 : isCompleted ? 3 : 2,
      });
      overlay.setMap(map);
      overlaysRef.current.push(overlay);
    });

    // User location marker
    if (userLocation?.lat != null && userLocation?.lng != null) {
      const userPos = new kakao.maps.LatLng(Number(userLocation.lat), Number(userLocation.lng));
      bounds.extend(userPos);
      const userOverlay = new kakao.maps.CustomOverlay({
        position: userPos,
        content: markerHtml('●', '#dc2626', 22, 'rgba(220,38,38,0.22)'),
        yAnchor: 0.5,
        xAnchor: 0.5,
        zIndex: 5,
      });
      userOverlay.setMap(map);
      overlaysRef.current.push(userOverlay);
    }

    // Route polyline
    if (validSpots.length > 1) {
      polylineRef.current = new kakao.maps.Polyline({
        map,
        path: validSpots.map((s) => new kakao.maps.LatLng(Number(s.lat), Number(s.lng))),
        strokeWeight: 3,
        strokeColor: '#0f8b6d',
        strokeOpacity: 0.65,
        strokeStyle: 'shortdash',
      });
    }

    // Fit all spots (single spot → manual zoom)
    if (validSpots.length === 1) {
      map.setCenter(new kakao.maps.LatLng(validSpots[0].lat, validSpots[0].lng));
      map.setLevel(4);
    } else {
      map.setBounds(bounds, 40, 40, 40, 40);
    }
  }, [phase, spots, activeSpotId, completedSpotIds, userLocation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      overlaysRef.current.forEach((o) => { try { o.setMap(null); } catch {} });
      if (polylineRef.current) { try { polylineRef.current.setMap(null); } catch {} }
      overlaysRef.current = [];
      polylineRef.current = null;
      mapRef.current = null;
    };
  }, []);

  // ── Render states ──

  if (phase === 'error') {
    return (
      <CourseMap
        spots={spots}
        activeSpotId={activeSpotId}
        completedSpotIds={completedSpotIds}
        userLocation={userLocation}
      />
    );
  }

  const validSpots = spots.filter((s) => s.lat != null && s.lng != null);

  if (phase !== 'ready') {
    return (
      <div className="course-map">
        <div className="kakao-map__loading" style={{ height }}>
          <Loader2 size={22} className="spin" />
          <span>Kakao Map 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (validSpots.length === 0) {
    return (
      <div className="course-map course-map--empty">
        <p>표시할 위치 정보가 없습니다</p>
      </div>
    );
  }

  const hasCompleted = completedSpotIds.length > 0;

  return (
    <div className="course-map">
      <div ref={containerRef} className="kakao-map__canvas" style={{ height }} />
      <div className="course-map__legend">
        <span className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--default" />방문 전
        </span>
        {activeSpotId && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--active" />현재 목표
          </span>
        )}
        {hasCompleted && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--completed" />방문 완료
          </span>
        )}
        {userLocation && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--user" />내 위치
          </span>
        )}
        <span className="map-source-badge map-source-badge--kakao">Kakao Map</span>
      </div>
    </div>
  );
}

export default KakaoCourseMap;
