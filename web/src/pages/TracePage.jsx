import { CheckCircle2, Crosshair, MapPinned, Navigation, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import MapWrapper from '../components/MapWrapper';
import ReviewModal from '../components/ReviewModal';
import { findCourse } from '../utils/courseStorage';
import {
  calculateDistanceMeters,
  canAutoCheckIn,
  getCurrentPosition,
  isWithinRadius,
} from '../utils/geo';
import { hasReviewedCourse, saveReview } from '../utils/reviewStorage';

const storageKey = (courseId) => `tripick-trace-${courseId}`;

function TracePage() {
  const { courseId } = useParams();
  const course = findCourse(courseId);
  const [visitedSpotIds, setVisitedSpotIds] = useState([]);
  const [statusMessage, setStatusMessage] = useState('체크인 준비가 되었습니다.');
  const [isLocating, setIsLocating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const prevProgressRef = useRef(null);

  useEffect(() => {
    if (!course) return;
    const saved = localStorage.getItem(storageKey(course.id));
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.visitedSpotIds)) {
        setVisitedSpotIds(parsed.visitedSpotIds);
      }
    } catch {
      localStorage.removeItem(storageKey(course.id));
    }
  }, [course]);

  useEffect(() => {
    if (!course) return;
    localStorage.setItem(
      storageKey(course.id),
      JSON.stringify({ visitedSpotIds, updatedAt: new Date().toISOString() }),
    );
  }, [course, visitedSpotIds]);

  const spots = useMemo(() => {
    if (!course) return [];
    return course.spots.map((spot) => ({
      ...spot,
      visited: visitedSpotIds.includes(spot.id),
    }));
  }, [course, visitedSpotIds]);

  const completedCount = visitedSpotIds.length;
  const progressPercent = course
    ? Math.round((completedCount / course.spotCount) * 100)
    : 0;

  useEffect(() => {
    const prev = prevProgressRef.current;
    prevProgressRef.current = progressPercent;
    if (!course || progressPercent < 70 || hasReviewedCourse(courseId)) return;
    if (prev === null || prev < 70) {
      setShowReviewModal(true);
    }
  }, [progressPercent, courseId, course]);

  if (!course) {
    return <Navigate to="/" replace />;
  }

  const currentSpot = spots.find((spot) => !spot.visited);

  const distanceToNext =
    userLocation && currentSpot
      ? Math.round(
          calculateDistanceMeters(userLocation, { lat: currentSpot.lat, lng: currentSpot.lng }),
        )
      : null;

  const isNearTarget = isWithinRadius(userLocation, currentSpot);

  const handleFetchLocation = async () => {
    setIsLocating(true);
    setGpsError('');
    try {
      const pos = await getCurrentPosition();
      setUserLocation(pos);
      if (currentSpot) {
        const dist = Math.round(
          calculateDistanceMeters(pos, { lat: currentSpot.lat, lng: currentSpot.lng }),
        );
        setStatusMessage(`위치 갱신 완료 — ${currentSpot.name}까지 ${dist}m`);
      } else {
        setStatusMessage('현재 위치를 가져왔습니다.');
      }
    } catch {
      setGpsError(
        'GPS 권한이 없거나 위치를 가져올 수 없습니다. 브라우저 설정을 확인해 주세요.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleManualCheckIn = () => {
    if (!currentSpot) {
      setStatusMessage('이미 모든 지점을 완료했습니다.');
      return;
    }
    setVisitedSpotIds((previous) =>
      previous.includes(currentSpot.id) ? previous : [...previous, currentSpot.id],
    );
    setStatusMessage(`${currentSpot.name} 체크인이 완료되었습니다.`);
  };

  const handleGpsCheckIn = async () => {
    if (!currentSpot) {
      setStatusMessage('이미 모든 지점을 완료했습니다.');
      return;
    }
    setIsLocating(true);
    setStatusMessage('현재 위치를 확인하는 중입니다...');
    setGpsError('');
    try {
      const currentPosition = await getCurrentPosition();
      setUserLocation(currentPosition);
      const destination = { lat: currentSpot.lat, lng: currentSpot.lng };
      const distance = calculateDistanceMeters(currentPosition, destination);
      if (canAutoCheckIn(currentPosition, destination)) {
        setVisitedSpotIds((previous) =>
          previous.includes(currentSpot.id) ? previous : [...previous, currentSpot.id],
        );
        setStatusMessage(
          `${currentSpot.name} 반경 50m 이내 확인 완료 (${Math.round(distance)}m).`,
        );
      } else {
        setStatusMessage(
          `${currentSpot.name}까지 ${Math.round(distance)}m 남았습니다. 수동 체크인을 사용할 수 있습니다.`,
        );
      }
    } catch {
      setGpsError(
        'GPS 위치를 가져오지 못했습니다. 브라우저 권한을 확인하거나 수동 체크인을 사용하세요.',
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleReset = () => {
    setVisitedSpotIds([]);
    setShowReviewModal(false);
    localStorage.removeItem(storageKey(course.id));
    setStatusMessage('수행 기록을 초기화했습니다.');
  };

  const handleReviewSubmit = ({ rating, comment }) => {
    saveReview({ courseId, rating, comment });
    setShowReviewModal(false);
    setStatusMessage('평가를 저장했습니다. 감사합니다!');
  };

  return (
    <div className="page">
      <section className="trace-header">
        <p className="eyebrow">Trace Mode</p>
        <h1>{course.title}</h1>
        <div className="trace-stats">
          <div>
            <span>진행률</span>
            <strong>
              {completedCount} / {course.spotCount}
            </strong>
          </div>
          <div>
            <span>완주율</span>
            <strong>{progressPercent}%</strong>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-track__fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="section section--compact">
        <div className="next-stop-card">
          <div className="next-stop-card__icon">
            <Navigation size={20} />
          </div>
          <div>
            <p className="section__eyebrow">Next Destination</p>
            <h2>{currentSpot ? currentSpot.name : '모든 지점 완료'}</h2>
            <p className="helper-text">{statusMessage}</p>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="section__header">
          <div>
            <p className="section__eyebrow">Live Map</p>
            <h2>코스 지도</h2>
          </div>
        </div>
        <MapWrapper
          spots={spots}
          activeSpotId={currentSpot?.id ?? null}
          completedSpotIds={visitedSpotIds}
          userLocation={userLocation}
        />
        <div className="map-controls">
          <button
            type="button"
            className="map-location-btn"
            onClick={handleFetchLocation}
            disabled={isLocating}
          >
            <Crosshair size={15} />
            {isLocating ? '위치 확인 중...' : '내 위치 갱신'}
          </button>
          {distanceToNext !== null && currentSpot && (
            <div className={`gps-status${isNearTarget ? ' gps-status--near' : ' gps-status--far'}`}>
              <span className="gps-status__dist">{distanceToNext}m</span>
              <span className="gps-status__label">
                {isNearTarget ? 'GPS 체크인 가능' : `${currentSpot.name}까지`}
              </span>
            </div>
          )}
          {gpsError && <p className="gps-error">{gpsError}</p>}
        </div>
      </section>

      <section className="section section--compact">
        <div className="trace-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleManualCheckIn}
            disabled={!currentSpot}
          >
            <CheckCircle2 size={18} />
            현재 지점 체크인
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleGpsCheckIn}
            disabled={!currentSpot || isLocating}
          >
            <Crosshair size={18} />
            {isLocating ? '위치 확인 중' : 'GPS 자동 체크인'}
          </button>
          <button type="button" className="ghost-button" onClick={handleReset}>
            <RefreshCw size={17} />
            기록 초기화
          </button>
        </div>
      </section>

      <section className="section section--compact">
        <div className="section__header">
          <div>
            <p className="section__eyebrow">Spot Status</p>
            <h2>지점별 방문 상태</h2>
          </div>
        </div>

        <div className="spot-list">
          {spots.map((spot, index) => (
            <div className={`spot-item ${spot.visited ? 'spot-item--done' : ''}`} key={spot.id}>
              <div className="spot-item__index">{index + 1}</div>
              <div className="spot-item__body">
                <strong>{spot.name}</strong>
                <span>
                  {spot.visited ? '방문 완료' : '방문 전'} · {spot.lat}, {spot.lng}
                </span>
              </div>
              <div className="spot-item__status">
                {spot.visited ? <CheckCircle2 size={18} /> : <MapPinned size={18} />}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showReviewModal && (
        <ReviewModal
          courseTitle={course.title}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
}

export default TracePage;
