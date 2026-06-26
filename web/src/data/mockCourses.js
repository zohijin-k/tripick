const createImage = (title, accent, subAccent) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${subAccent}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="980" cy="180" r="140" fill="rgba(255,255,255,0.18)" />
      <circle cx="210" cy="620" r="180" fill="rgba(255,255,255,0.12)" />
      <text x="70" y="150" font-size="42" font-family="Arial, sans-serif" fill="white" opacity="0.88">TRIPICK JEONJU</text>
      <text x="70" y="320" font-size="92" font-weight="700" font-family="Arial, sans-serif" fill="white">${title}</text>
      <text x="70" y="405" font-size="34" font-family="Arial, sans-serif" fill="white" opacity="0.9">Verified Local Course</text>
      <rect x="70" y="470" width="420" height="10" rx="5" fill="rgba(255,255,255,0.28)" />
      <rect x="70" y="470" width="280" height="10" rx="5" fill="white" />
    </svg>
  `)}`;

const mockCourses = [
  {
    id: 'jeonju-night-walk',
    title: '전주 야경 산책로',
    area: '전주',
    theme: '야경',
    distance: '3.4km',
    spotCount: 5,
    completionRate: 92,
    averageRating: 4.7,
    performers: 86,
    imageUrl: createImage('Night Walk', '#0f766e', '#172554'),
    spots: [
      { id: 'jnw-1', name: '전동성당', lat: 35.8142, lng: 127.148, visited: false },
      { id: 'jnw-2', name: '경기전 돌담길', lat: 35.8151, lng: 127.1494, visited: false },
      { id: 'jnw-3', name: '한벽당 전망 포인트', lat: 35.8126, lng: 127.1589, visited: false },
      { id: 'jnw-4', name: '자만벽화마을 입구', lat: 35.8106, lng: 127.1582, visited: false },
      { id: 'jnw-5', name: '오목대 야경 포인트', lat: 35.8114, lng: 127.1551, visited: false },
    ],
  },
  {
    id: 'gaekridan-cafe',
    title: '객리단길 카페투어',
    area: '전주',
    theme: '카페',
    distance: '2.1km',
    spotCount: 4,
    completionRate: 88,
    averageRating: 4.8,
    performers: 64,
    imageUrl: createImage('Cafe Tour', '#166534', '#1e3a8a'),
    spots: [
      { id: 'gct-1', name: '객사 메인거리', lat: 35.8211, lng: 127.1464, visited: false },
      { id: 'gct-2', name: '로스터리 카페 거리', lat: 35.8194, lng: 127.1458, visited: false },
      { id: 'gct-3', name: '전주 영화의거리', lat: 35.8183, lng: 127.1447, visited: false },
      { id: 'gct-4', name: '감성 디저트 카페 존', lat: 35.8175, lng: 127.1438, visited: false },
    ],
  },
  {
    id: 'seohak-art',
    title: '서학동 예술마을 코스',
    area: '전주',
    theme: '예술',
    distance: '2.8km',
    spotCount: 5,
    completionRate: 84,
    averageRating: 4.5,
    performers: 58,
    imageUrl: createImage('Art Village', '#047857', '#1d4ed8'),
    spots: [
      { id: 'sac-1', name: '서학동예술마을 안내소', lat: 35.8078, lng: 127.1549, visited: false },
      { id: 'sac-2', name: '독립서점 골목', lat: 35.8072, lng: 127.1562, visited: false },
      { id: 'sac-3', name: '공방 거리', lat: 35.8064, lng: 127.1572, visited: false },
      { id: 'sac-4', name: '갤러리 포인트', lat: 35.8056, lng: 127.1583, visited: false },
      { id: 'sac-5', name: '천변 산책 구간', lat: 35.8048, lng: 127.1595, visited: false },
    ],
  },
  {
    id: 'hanok-bypass',
    title: '한옥마을 우회 코스',
    area: '전주',
    theme: '로컬',
    distance: '3.0km',
    spotCount: 6,
    completionRate: 79,
    averageRating: 4.4,
    performers: 42,
    imageUrl: createImage('Local Detour', '#15803d', '#1e40af'),
    spots: [
      { id: 'hbc-1', name: '풍남문', lat: 35.8134, lng: 127.1467, visited: false },
      { id: 'hbc-2', name: '전주천 산책로', lat: 35.8122, lng: 127.1515, visited: false },
      { id: 'hbc-3', name: '남천교', lat: 35.8098, lng: 127.1559, visited: false },
      { id: 'hbc-4', name: '자만마을 골목', lat: 35.8109, lng: 127.1586, visited: false },
      { id: 'hbc-5', name: '한옥 뷰 숨은 포인트', lat: 35.8131, lng: 127.1539, visited: false },
      { id: 'hbc-6', name: '전주향교 주변길', lat: 35.8157, lng: 127.1511, visited: false },
    ],
  },
  {
    id: 'nambu-market-youth',
    title: '남부시장 청년몰 코스',
    area: '전주',
    theme: '시장',
    distance: '1.9km',
    spotCount: 4,
    completionRate: 90,
    averageRating: 4.6,
    performers: 73,
    imageUrl: createImage('Youth Mall', '#0f766e', '#1e40af'),
    spots: [
      { id: 'nmy-1', name: '남부시장 입구', lat: 35.8102, lng: 127.1431, visited: false },
      { id: 'nmy-2', name: '청년몰 메인존', lat: 35.8096, lng: 127.1438, visited: false },
      { id: 'nmy-3', name: '먹거리 골목', lat: 35.8089, lng: 127.1449, visited: false },
      { id: 'nmy-4', name: '야시장 포인트', lat: 35.8082, lng: 127.1457, visited: false },
    ],
  },
  {
    id: 'deokjin-lake',
    title: '덕진공원 호수 산책',
    area: '전주',
    theme: '자연',
    distance: '3.8km',
    spotCount: 5,
    completionRate: 76,
    averageRating: 4.3,
    performers: 37,
    imageUrl: createImage('Lake Walk', '#065f46', '#1e3a8a'),
    spots: [
      { id: 'dlw-1', name: '덕진공원 입구', lat: 35.8465, lng: 127.1284, visited: false },
      { id: 'dlw-2', name: '연못 전망 데크', lat: 35.8471, lng: 127.1295, visited: false },
      { id: 'dlw-3', name: '다리 포토 포인트', lat: 35.8476, lng: 127.1309, visited: false },
      { id: 'dlw-4', name: '호수 둘레길 쉼터', lat: 35.8482, lng: 127.1324, visited: false },
      { id: 'dlw-5', name: '야외 공연장 주변', lat: 35.8487, lng: 127.1336, visited: false },
    ],
  },
];

export default mockCourses;
