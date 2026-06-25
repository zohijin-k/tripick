import { Navigation } from 'lucide-react';

function CourseMap({
  spots = [],
  activeSpotId = null,
  completedSpotIds = [],
  userLocation = null,
}) {
  const validSpots = spots.filter(
    (s) =>
      s.lat != null &&
      s.lng != null &&
      !Number.isNaN(Number(s.lat)) &&
      !Number.isNaN(Number(s.lng)),
  );

  if (validSpots.length === 0) {
    return (
      <div className="course-map course-map--empty">
        <p>표시할 위치 정보가 없습니다</p>
      </div>
    );
  }

  const lats = validSpots.map((s) => Number(s.lat));
  const lngs = validSpots.map((s) => Number(s.lng));
  const rawMinLat = Math.min(...lats);
  const rawMaxLat = Math.max(...lats);
  const rawMinLng = Math.min(...lngs);
  const rawMaxLng = Math.max(...lngs);

  const latSpan = rawMaxLat - rawMinLat;
  const lngSpan = rawMaxLng - rawMinLng;
  const latPad = Math.max(latSpan * 0.4, 0.003);
  const lngPad = Math.max(lngSpan * 0.4, 0.003);

  const minLat = rawMinLat - latPad;
  const maxLat = rawMaxLat + latPad;
  const minLng = rawMinLng - lngPad;
  const maxLng = rawMaxLng + lngPad;

  const latRange = maxLat - minLat;
  const lngRange = maxLng - minLng;

  const toPos = (lat, lng) => ({
    x: Math.max(2, Math.min(98, ((lng - minLng) / lngRange) * 100)),
    y: Math.max(2, Math.min(98, 100 - ((lat - minLat) / latRange) * 100)),
  });

  const spotPos = validSpots.map((s) => toPos(Number(s.lat), Number(s.lng)));
  const userPos = userLocation ? toPos(userLocation.lat, userLocation.lng) : null;

  const polylinePoints = spotPos.map((p) => `${p.x},${p.y}`).join(' ');

  const hasCompleted = completedSpotIds.length > 0;
  const hasActive = activeSpotId != null;

  return (
    <div className="course-map">
      <div className="course-map__canvas">
        <svg
          className="course-map__svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {[20, 40, 60, 80].flatMap((v) => [
            <line
              key={`h${v}`}
              x1="0"
              y1={v}
              x2="100"
              y2={v}
              stroke="#c4d4df"
              strokeWidth="0.5"
            />,
            <line
              key={`v${v}`}
              x1={v}
              y1="0"
              x2={v}
              y2="100"
              stroke="#c4d4df"
              strokeWidth="0.5"
            />,
          ])}
          {validSpots.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#0f8b6d"
              strokeWidth="1.6"
              strokeDasharray="4,3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
            />
          )}
        </svg>

        {validSpots.map((spot, i) => {
          const pos = spotPos[i];
          const isActive = spot.id === activeSpotId;
          const isCompleted = completedSpotIds.includes(spot.id);

          let cls = 'map-marker';
          if (isCompleted) cls += ' map-marker--completed';
          else if (isActive) cls += ' map-marker--active';

          return (
            <div
              key={spot.id}
              className={cls}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {i + 1}
              <div className="map-marker__tooltip">{spot.name}</div>
            </div>
          );
        })}

        {userPos && (
          <div
            className="map-marker map-marker--user"
            style={{ left: `${userPos.x}%`, top: `${userPos.y}%` }}
          >
            <Navigation size={10} />
            <div className="map-marker__tooltip">내 위치</div>
          </div>
        )}
      </div>

      <div className="course-map__legend">
        <span className="map-legend-item">
          <span className="map-legend-dot map-legend-dot--default" />
          방문 전
        </span>
        {hasActive && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--active" />
            현재 목표
          </span>
        )}
        {hasCompleted && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--completed" />
            방문 완료
          </span>
        )}
        {userLocation && (
          <span className="map-legend-item">
            <span className="map-legend-dot map-legend-dot--user" />
            내 위치
          </span>
        )}
        <span className="map-source-badge map-source-badge--mock">Preview Map</span>
      </div>
    </div>
  );
}

export default CourseMap;
