# TRIPICK App

React Native + Expo + TypeScript 기반 모바일 앱

## 실행 방법

```bash
cd app
npm install
npx expo start
```

- `i` → iOS 시뮬레이터
- `a` → Android 에뮬레이터
- QR 코드 스캔 → Expo Go 앱으로 실기기 실행

TypeScript 타입 검사만 실행:
```bash
npm run ts-check
```

## 환경 변수 설정 (TourAPI)

```bash
cd app
cp .env.example .env   # EXPO_PUBLIC_TOUR_API_KEY 입력 후 저장
```

- `EXPO_PUBLIC_TOUR_API_KEY` — 한국관광공사 TourAPI v2 서비스 키. [data.go.kr](https://www.data.go.kr/data/15101578/openapi.do)에서 발급받으며, 반드시 **일반 인증키 (Decoding)** 값을 사용해야 합니다 (Encoding 키를 넣으면 이중 인코딩으로 인증이 실패합니다).
- Expo는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 앱 번들에 인라인되어 `process.env.EXPO_PUBLIC_TOUR_API_KEY`로 읽을 수 있습니다. 웹(Vite)의 `import.meta.env`는 RN에서 사용할 수 없습니다.
- `app/.env`는 `.gitignore`에 포함되어 있어 **절대 커밋되지 않습니다**.
- 키가 없거나 요청이 실패하면 자동으로 `src/data/jeonjuSpots.ts`의 mock 전주 관광지 데이터로 fallback하므로, 키 없이도 앱 전체 기능(Smart Course 포함)이 정상 동작합니다.

### Fallback 구조

```
useTourSpots() 훅
  └─ fetchJeonjuSpots() (src/api/tourApi.ts)
       ├─ 키 없음            → null 반환
       ├─ 네트워크/인증 오류 → null 반환 (try/catch)
       ├─ 응답은 왔지만 0건  → [] 반환
       └─ 정상 응답          → 정규화된 Spot[] 반환
  └─ null 또는 빈 배열이면 jeonjuSpots.ts mock 데이터로 자동 전환
  └─ { spots, loading, error, source: 'api' | 'mock' } 반환
```

`SmartCourseScreen`은 이 훅으로 관광지 후보를 받아 스마트 코스를 생성하며, 화면 상단에 현재 데이터 소스(`TourAPI 연동` / `Mock 데이터`) 배지를 표시합니다.

## 현재 구현 화면

### HomeScreen
- TRIPICK 브랜드 헤로 섹션 (검증 코스 수, 총 수행자, 평균 만족도)
- TRIPICK Score 산정식 설명 카드
- 검증된 코스 TOP 5 랭킹 (`mockCourses.ts` 기준)
- 각 코스 카드에 TRIPICK Score, Trust Score, 완주율, 만족도, 수행자 수, 지점 수 표시

## 폴더 구조

```
app/
├── src/
│   ├── screens/
│   │   └── HomeScreen.tsx    # 홈 화면 (코스 랭킹)
│   ├── components/
│   │   └── CourseCard.tsx    # 코스 카드 컴포넌트
│   ├── data/
│   │   └── mockCourses.ts    # 전주 코스 mock 데이터 (6개)
│   ├── utils/
│   │   ├── score.ts          # TRIPICK Score 계산 (web 이식)
│   │   └── trustScore.ts     # Trust Score 계산 (web 이식)
│   └── types/
│       └── course.ts         # Course, Spot, Review 타입 정의
├── App.tsx                   # 루트 컴포넌트
├── app.json                  # Expo 설정
├── babel.config.js
├── tsconfig.json
└── package.json
```

## 기술 스택

| 항목 | 선택 | 버전 |
|---|---|---|
| 런타임 | Expo SDK | 54.0.35 |
| React | React 19 | 19.1.0 |
| React Native | New Architecture 기본 활성 | 0.81.5 |
| 언어 | TypeScript (strict) | 5.8.3 |
| SafeArea | react-native-safe-area-context | 5.6.2 |
| 내비게이션 | 없음 (단일 화면) | 다음 화면 추가 시 React Navigation 도입 예정 |
| 지도 | 미구현 | react-native-maps 또는 Kakao SDK 예정 |
| 위치 | 미구현 | expo-location 도입 예정 |

## web MVP와의 관계

| 항목 | web (`web/`) | app (`app/`) |
|---|---|---|
| 언어 | JavaScript | TypeScript |
| 라우터 | react-router-dom | React Navigation (예정) |
| 스타일 | CSS / CSS Modules | StyleSheet.create |
| 지도 | Kakao Map SDK (Web) | react-native-maps (예정) |
| 데이터 | localStorage | AsyncStorage (예정) |
| 점수 계산 | `src/utils/score.js` | `src/utils/score.ts` (동일 로직) |
| Trust Score | `src/utils/trustScore.js` | `src/utils/trustScore.ts` (동일 로직) |

## 향후 구현 계획

### 단계 1 — 화면 추가
- [ ] CourseDetailScreen (코스 상세 + Trust Score)
- [ ] TraceScreen (수행 + GPS 체크인)
- [ ] React Navigation Stack 도입

### 단계 2 — 기능 추가
- [ ] expo-location으로 GPS 체크인
- [ ] react-native-maps 지도 뷰
- [ ] AsyncStorage 코스 저장
- [ ] SmartCourseScreen

### 단계 3 — 백엔드 연동
- [ ] backend API 연동 (localStorage → 서버)
- [ ] 리뷰 작성 및 조회
- [ ] 푸시 알림 (expo-notifications)
