import CourseMap from './CourseMap';
import KakaoCourseMap from './KakaoCourseMap';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;
const useKakao = Boolean(KAKAO_KEY && KAKAO_KEY.trim().length > 0);

/**
 * 환경변수 VITE_KAKAO_MAP_KEY가 설정되어 있으면 KakaoCourseMap을,
 * 없거나 SDK 로드에 실패하면 기존 CourseMap(mock)으로 자동 fallback합니다.
 */
function MapWrapper({
  spots = [],
  activeSpotId = null,
  completedSpotIds = [],
  userLocation = null,
  height = 260,
}) {
  if (useKakao) {
    return (
      <KakaoCourseMap
        spots={spots}
        activeSpotId={activeSpotId}
        completedSpotIds={completedSpotIds}
        userLocation={userLocation}
        height={height}
      />
    );
  }

  return (
    <CourseMap
      spots={spots}
      activeSpotId={activeSpotId}
      completedSpotIds={completedSpotIds}
      userLocation={userLocation}
    />
  );
}

export default MapWrapper;
