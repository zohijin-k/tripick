import type { Spot } from '../types/course';

export interface CoursePreferences {
  style: string;
  duration: string;
  transport: string;
}

const STYLE_REASONS: Record<string, (n: number) => string> = {
  감성: (n) => `감성적인 카페와 예술 공간 ${n}곳을 연결한 분위기 있는 코스입니다.`,
  역사: (n) => `전주의 역사적 명소 ${n}곳을 따라 걷는 시간 여행 코스입니다.`,
  야경: (n) => `야경이 아름다운 뷰포인트 ${n}곳을 골든아워에 맞춰 배치했습니다.`,
  먹거리: (n) => `전주 대표 먹거리 스팟 ${n}곳을 효율적으로 탐방하는 미식 코스입니다.`,
  자연: (n) => `자연 속에서 힐링할 수 있는 ${n}개 장소를 선별했습니다.`,
  로컬: (n) => `현지인이 즐겨 찾는 골목과 명소 ${n}곳을 담은 알짜 코스입니다.`,
};

const TRANSPORT_REASONS: Record<string, string> = {
  도보: '두 발로 걸으며 골목골목 전주의 매력을 오롯이 느낄 수 있습니다.',
  대중교통: '대중교통으로 편리하게 이동할 수 있어 체력 소모 없이 즐길 수 있습니다.',
  자전거: '자전거로 빠르게 이동하며 더 넓은 범위를 탐방할 수 있습니다.',
};

const DURATION_REASONS: Record<string, string> = {
  '짧은 코스': '1~2시간 내에 핵심 명소만 골라 방문하는 효율적인 코스입니다.',
  반나절: '3~4시간의 여유로운 반나절 일정으로 설계된 코스입니다.',
  하루: '전주의 다채로운 매력을 하루 종일 깊이 있게 즐길 수 있습니다.',
};

/**
 * Returns 1-3 human-readable recommendation strings based on
 * the selected preferences and the number of spots in the course.
 */
export function generateRecommendationReasons(
  spots: Spot[],
  preferences: CoursePreferences,
): string[] {
  const reasons: string[] = [];

  const styleReason = STYLE_REASONS[preferences.style];
  if (styleReason) reasons.push(styleReason(spots.length));

  const transportReason = TRANSPORT_REASONS[preferences.transport];
  if (transportReason) reasons.push(transportReason);

  const durationReason = DURATION_REASONS[preferences.duration];
  if (durationReason) reasons.push(durationReason);

  return reasons;
}
