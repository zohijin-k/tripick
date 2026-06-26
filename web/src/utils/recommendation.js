const STYLE_PHRASES = {
  감성: '감성적인 분위기와 카페·로컬 장소 중심의',
  역사: '역사·문화유산 중심의',
  야경: '야간 방문 및 야경 감상에 적합한',
  먹거리: '현지 먹거리와 시장 탐방 중심의',
  자연: '자연 경관과 산책을 즐길 수 있는',
  로컬: '지역 상권과 골목 관광 중심의',
};

const CATEGORY_CONTEXT = {
  카페: '카페·음료 문화를 체험할 수 있는 장소입니다.',
  예술: '예술·공방 골목의 감성을 느낄 수 있는 장소입니다.',
  로컬: '지역민이 즐겨 찾는 로컬 명소입니다.',
  역사: '전주의 역사와 전통을 간직한 유서 깊은 장소입니다.',
  문화시설: '전주의 문화·역사를 직접 체험할 수 있는 시설입니다.',
  야경: '야간에 방문하면 더욱 빛나는 전망 포인트입니다.',
  시장: '전통 시장의 활기찬 분위기를 느낄 수 있는 곳입니다.',
  자연: '자연 속에서 여유로운 산책을 즐길 수 있는 장소입니다.',
  산책: '한적하게 산책하기 좋은 자연 친화적 코스입니다.',
  음식: '전주 전통 음식을 맛볼 수 있는 식도락 명소입니다.',
  관광지: '전주를 대표하는 관광 명소입니다.',
};

const TRANSPORT_CONTEXT = {
  도보: '도보로 이동하기에 알맞은 동선에 위치합니다.',
  대중교통: '대중교통으로 접근하기 편리한 위치입니다.',
  자전거: '자전거로 둘러보기 좋은 이동형 코스입니다.',
};

function buildReason(spot, { style, transport }) {
  const stylePhrase = STYLE_PHRASES[style] ?? '';
  const categoryContext = CATEGORY_CONTEXT[spot.category] ?? '전주의 주요 관광지입니다.';
  const transportContext = TRANSPORT_CONTEXT[transport] ?? '';

  return `${stylePhrase} 여행 코스에 포함된 장소입니다. ${categoryContext} ${transportContext}`.trim();
}

/**
 * 자동 생성 코스의 장소별 추천 근거를 생성합니다.
 *
 * @param {Array} spots - 선택된 원본 관광지 배열 (category 필드 포함)
 * @param {{ style: string, duration: string, transport: string }} preferences
 * @returns {string[]} - spots와 동일한 순서의 추천 근거 문장 배열
 */
export function generateRecommendationReasons(spots, preferences) {
  return spots.map((spot) => buildReason(spot, preferences));
}
