# TRIPICK App

Expo + React Native + TypeScript 기반 참여형 관광 코스 앱입니다.

## 실행

```bash
cd app
npm install
cp .env.example .env
npx expo start
```

`app/.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

실기기에서는 `localhost` 대신 백엔드를 실행하는 PC의 LAN IP를 사용합니다.

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:3000/api
```

## 구현 화면과 기능

- Home: 검증 코스 랭킹, 내 코스, 현재 위치 기반 주변 코스 제안
- Profile: 여행 스타일, 선호 시간, 이동 방식 저장
- Smart Course: 프로필 취향을 기본값으로 사용해 코스 생성
- Course Detail: 실제 지도, 장소 목록, TRIPICK/Trust Score, 리뷰
- Nearby Courses: 위치 진입 시 추천된 코스를 좌우 스와이프로 비교
- Trace: GPS 연속 추적, 목적지 50m 진입 시 자동 체크인, 진행 상태 복구
- Review: 전 지점 자동 체크인 완료 후 리뷰 작성

서버 연결 실패 시 관광지·코스·리뷰·진행 상태는 기존 mock/AsyncStorage fallback을 사용합니다.

## 위치와 알림

- `expo-location`: Trace 화면에서 위치를 계속 관찰하고 50m 이내 진입을 감지합니다.
- `expo-notifications`: 관광지 주변에서 추천 코스가 발견되면 로컬 알림을 표시합니다.
- `react-native-maps`: iOS/Android에서 도로, 건물, POI, 경로, 목적지 마커를 표시합니다.
- 웹에서는 네이티브 지도 대신 기존 Map Preview fallback을 사용합니다.

수동 체크인은 제거했습니다. 좌표가 없는 장소는 자동 체크인할 수 있으므로 TourAPI 데이터 적재 시 좌표를 필수로 확인해야 합니다.

## Trust Score 기준

| 지표 | 배점 | 기준 |
|---|---:|---|
| 완주 검증 | 35 | GPS 전체 완주 세션 / 코스 시작 세션 |
| 리뷰 신뢰도 | 25 | GPS 완주 리뷰 비율, 리뷰 표본 수, 별점 일관성 |
| 수행자 수 | 20 | 코스 수행을 시작한 고유 사용자 수 |
| GPS 검증 | 10 | 50m 이내 자동 체크인 / 전체 체크인 |
| 데이터 품질 | 10 | 좌표, 주소, 이미지, TourAPI ID, 카테고리 충실도 |

`GPS 검증`은 관광지가 현재 영업 중인지를 뜻하지 않습니다. 해당 판단은 운영 상태 API나 관리자 검수가 별도로 필요합니다.

## 검증

```bash
npm run ts-check
```

네이티브 모듈 설정이 바뀌었으므로 배포 빌드에서는 새 development build/EAS build를 생성해야 합니다. Expo Go에서는 SDK 지원 범위 안에서 지도와 전경 위치 추적을 확인할 수 있습니다.
