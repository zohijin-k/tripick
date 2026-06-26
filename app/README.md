# TRIPICK App

React Native + Expo 기반 모바일 앱 (예정)

## 전환 계획

웹 MVP(`web/`)에서 검증된 핵심 흐름을 네이티브 앱으로 이식합니다.

### 1단계 — 핵심 화면 이식

| 화면 | 웹 대응 | 우선순위 |
|---|---|---|
| 홈 (코스 랭킹) | `HomePage.jsx` | 1 |
| 코스 상세 + Trust Score | `CourseDetailPage.jsx` | 1 |
| Trace 수행 + GPS 체크인 | `TracePage.jsx` | 1 |
| Smart Course Builder | `SmartCoursePage.jsx` | 2 |
| 코스 직접 생성 | `CreateCoursePage.jsx` | 2 |

### 2단계 — 앱 전용 기능

- 푸시 알림 (방문 완료, 코스 추천)
- 오프라인 모드 (코스 캐싱)
- 카메라 체크인 (장소 사진 업로드)
- 네이티브 지도 (React Native Maps)

## 기술 스택 (예정)

- React Native
- Expo SDK
- React Navigation
- Zustand (상태 관리)
- React Native Maps

## 시작하기

```bash
# 추후 추가 예정
cd app
npm install
npx expo start
```
