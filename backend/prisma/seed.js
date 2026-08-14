const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const courses = [
  {
    id: 'jeonju-night-walk', title: '전주 야경 산책로', area: '전주', theme: '야경', distance: '3.4km',
    spots: [
      ['jnw-1', '전동성당', 35.8142, 127.148],
      ['jnw-2', '경기전 돌담길', 35.8151, 127.1494],
      ['jnw-3', '한벽당 전망 포인트', 35.8126, 127.1589],
      ['jnw-4', '자만벽화마을 입구', 35.8106, 127.1582],
      ['jnw-5', '오목대 야경 포인트', 35.8114, 127.1551],
    ],
  },
  {
    id: 'gaekridan-cafe', title: '객리단길 카페투어', area: '전주', theme: '카페', distance: '2.1km',
    spots: [
      ['gct-1', '객사 메인거리', 35.8211, 127.1464],
      ['gct-2', '로스터리 카페 거리', 35.8194, 127.1458],
      ['gct-3', '전주 영화의거리', 35.8183, 127.1447],
      ['gct-4', '감성 디저트 카페 존', 35.8175, 127.1438],
    ],
  },
  {
    id: 'seohak-art', title: '서학동 예술마을 코스', area: '전주', theme: '예술', distance: '2.8km',
    spots: [
      ['sac-1', '서학동예술마을 안내소', 35.8078, 127.1549],
      ['sac-2', '독립서점 골목', 35.8072, 127.1562],
      ['sac-3', '공방 거리', 35.8064, 127.1572],
      ['sac-4', '갤러리 포인트', 35.8056, 127.1583],
      ['sac-5', '천변 산책 구간', 35.8048, 127.1595],
    ],
  },
  {
    id: 'hanok-bypass', title: '한옥마을 우회 코스', area: '전주', theme: '로컬', distance: '3.0km',
    spots: [
      ['hbc-1', '풍남문', 35.8134, 127.1467],
      ['hbc-2', '전주천 산책로', 35.8122, 127.1515],
      ['hbc-3', '남천교', 35.8098, 127.1559],
      ['hbc-4', '자만마을 골목', 35.8109, 127.1586],
      ['hbc-5', '한옥 뷰 숨은 포인트', 35.8131, 127.1539],
      ['hbc-6', '전주향교 주변길', 35.8157, 127.1511],
    ],
  },
  {
    id: 'nambu-market-youth', title: '남부시장 청년몰 코스', area: '전주', theme: '시장', distance: '1.9km',
    spots: [
      ['nmy-1', '남부시장 입구', 35.8102, 127.1431],
      ['nmy-2', '청년몰 메인존', 35.8096, 127.1438],
      ['nmy-3', '먹거리 골목', 35.8089, 127.1449],
      ['nmy-4', '야시장 포인트', 35.8082, 127.1457],
    ],
  },
  {
    id: 'deokjin-lake', title: '덕진공원 호수 산책', area: '전주', theme: '자연', distance: '3.8km',
    spots: [
      ['dlw-1', '덕진공원 입구', 35.8465, 127.1284],
      ['dlw-2', '연못 전망 데크', 35.8471, 127.1295],
      ['dlw-3', '다리 포토 포인트', 35.8476, 127.1309],
      ['dlw-4', '호수 둘레길 쉼터', 35.8482, 127.1324],
      ['dlw-5', '야외 공연장 주변', 35.8487, 127.1336],
    ],
  },
  // ─── 유네스코 음식창의도시 전주 · 미식 코스 (숨은 스팟 포함) ──────────────
  // 스팟 5번째 값 true = 숨은 스팟(isHidden). 좌표에 TODO 표시된 곳은
  // 네이버지도에서 상호 검색 → 좌표 확인 후 확정할 것 (체크인 반경 50m라 중요).
  {
    id: 'jeonju-gukbap-road',
    title: '새벽 콩나물국밥 로드',
    area: '전주',
    theme: '미식',
    distance: '2.3km',
    recommendationReasons: [
      '유네스코 음식창의도시 전주의 새벽 국밥 문화를 걷는 코스',
      '남부시장 → 동문거리, 한옥마을 밖 원도심 상권으로 이어지는 길',
      '체크인으로 검증된 로컬 국밥집 — 광고로 못 사는 별점',
    ],
    spots: [
      ['jgr-1', '풍남문', 35.8134, 127.1467],
      ['jgr-2', '남부시장 먹거리골목', 35.8095, 127.1435], // TODO(지니): 좌표 확인
      ['jgr-3', '현대옥 남부시장점', 35.8097, 127.1437, true], // TODO(지니): 좌표 확인 (시장 내부)
      ['jgr-4', '전동성당', 35.8142, 127.148],
      ['jgr-5', '왱이집 (동문길 88)', 35.81824, 127.14918, true],
    ],
  },
  {
    id: 'jeonju-gamek-tour',
    title: '전주 가맥 골목 투어',
    area: '전주',
    theme: '미식',
    distance: '1.8km',
    recommendationReasons: [
      '전주에만 있는 가게맥주(가맥) 문화 — 슈퍼에서 마시는 맥주와 갑오징어',
      '객리단길·영화의거리·가맥거리를 잇는 저녁 코스',
      '한옥마을 밖 원도심, 숨은 전주 보너스 적용 코스',
    ],
    spots: [
      ['jgt-1', '객사 메인거리', 35.8211, 127.1464],
      ['jgt-2', '삼백집 본점 (전주객사2길 22)', 35.8198, 127.145, true], // TODO(지니): 좌표 확인
      ['jgt-3', '전주 영화의거리', 35.8183, 127.1447],
      ['jgt-4', '전일갑오 (현무1길)', 35.8172, 127.147, true], // TODO(지니): 좌표 확인
      ['jgt-5', '영동슈퍼 (현무1길 14)', 35.8177, 127.1477, true], // TODO(지니): 좌표 확인
    ],
  },
];

async function main() {
  for (const course of courses) {
    const courseData = {
      title: course.title,
      area: course.area,
      theme: course.theme,
      distance: course.distance,
      recommendationReasons: course.recommendationReasons ?? [],
    };
    await prisma.course.upsert({
      where: { id: course.id },
      update: courseData,
      create: { id: course.id, ...courseData },
    });

    for (const [index, spot] of course.spots.entries()) {
      const [id, name, lat, lng, isHidden = false] = spot;
      const spotData = { courseId: course.id, sourceSpotId: id, name, lat, lng, isHidden, order: index };
      await prisma.courseSpot.upsert({
        where: { id },
        update: spotData,
        create: { id, ...spotData },
      });
    }
  }

  console.log(`Seeded ${courses.length} beta courses.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
