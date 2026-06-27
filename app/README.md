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
