# TRIPICK (트리픽)

> **직접 걸어서 검증하는 전주 여행 코스** — 실제 이동 데이터(GPS 로그)로 관광 코스를 검증하고 랭킹화하는 참여형 관광 플랫폼

기존 여행 추천 서비스는 별점·리뷰 같은 주관적 평가에 의존해 '추천'에서 멈춥니다.
TRIPICK은 사용자가 코스를 만들고, 다른 사용자가 **실제로 걸으며 GPS로 검증**하고, 그 데이터가 다시 랭킹에 반영되는 **추천 → 수행 → 검증 → 재추천**의 데이터 선순환 구조를 가집니다.

`2026 관광데이터 활용 공모전` 출품작 · Team **Retour**

## 데모

| 채널 | 링크 |
|---|---|
| 웹 | https://tripick.vercel.app |
| API (공개 베타) | https://tripick-api.onrender.com/api |
| Swagger 문서 | https://tripick-api.onrender.com/api-docs |
| 안드로이드 앱 | (스토어 심사 중 — 출시 후 링크 추가) |

> 📍 **전주에 없어도 체험할 수 있어요** — 앱의 코스 수행 화면에서 **체험 모드**를 켜면 GPS 없이 가상 이동으로 체크인 → 완주 → 리뷰 → 랭킹 반영까지 전체 흐름을 경험할 수 있습니다. (체험 체크인은 실제 GPS 기록과 구분 저장되어 랭킹 신뢰도를 해치지 않습니다)

## 핵심 기능

- **코스 생성** — 한국관광공사 TourAPI 관광지 데이터 기반으로 여행 스타일·시간·이동 방식만 고르면 맞춤 코스 자동 생성, 대표 사진 업로드
- **Trace 수행** — 지점 50m 이내 진입 시 GPS 자동 체크인, 실시간 진행률·경로 지도
- **수행 기반 평가** — 완주 후 별점 리뷰, 완주율 70% 미만 리뷰는 가중치 1/3로 반영
- **신뢰도 랭킹** — 완주율·만족도·수행자 수 가중 조합, 수행자 5명 이상부터 검증 랭킹 반영
- **부정행위 방지** — 이동 속도 임계치 기반 GPS 스푸핑 탐지 시 체크인 보류
- **전주 특화 분산 가중치** — 한옥마을 핵심권(중심 600m, 좌표 기반 판정) 밖 코스에 +20% 가산 → 객리단길·서학동·남부시장 등 숨은 코스 발굴

## TRIPICK Score 산정식

```
Score = 0.5 × 완주율 + 0.3 × (만족도/5 × 100) + 0.2 × (log₁₀(수행자+1)/log₁₀(100) × 100)
      × 1.2 (한옥마을 핵심권 외 코스 분산 가중치)
```

의견이 아닌 **실제 수행 데이터만** 사용하며, log 스케일로 신생 코스의 불이익을 완화합니다.

## 아키텍처

```
tripick/
├── app/        # React Native + Expo 54 + TypeScript — 메인 모바일 앱
├── web/        # React 18 + Vite — 웹 MVP
├── backend/    # NestJS + Prisma + PostgreSQL — API 서버 · TourAPI 프록시 (Render 배포)
└── README.md
```

- 활용 OpenAPI: **한국관광공사 TourAPI 4.0** (관광지 후보 풀·대표 이미지)
- TourAPI 호출은 **오직 backend에서만** 수행 — API 키는 `backend/.env`의 `TOUR_API_KEY`로만 관리하고 클라이언트 코드에 포함하지 않습니다
- 앱·웹은 backend 미연결 시 내장 mock 데이터로 자동 fallback

## 실행 방법

### 앱 (React Native + Expo)

```bash
cd app
npm install
cp .env.example .env
npx expo start
```

`.env`에 backend 주소 설정 (없어도 mock 데이터로 동작):

```env
# 공개 베타 backend 사용 시
EXPO_PUBLIC_API_BASE_URL=https://tripick-api.onrender.com/api
```

> ⚠️ 실기기(Expo Go)에서 로컬 backend에 붙을 땐 `localhost` 대신 Mac의 로컬 IP를 사용하세요 (`ipconfig getifaddr en0`).
> Render 무료 인스턴스는 유휴 시 잠들어 첫 요청이 1분 정도 걸릴 수 있습니다.

### Backend (NestJS)

```bash
cd backend
npm install
cp .env.example .env   # TOUR_API_KEY 입력 (없어도 서버 기동, 관광지 API만 503)
npm run start:dev
```

서버 `http://localhost:3000/api` · Swagger `http://localhost:3000/api-docs`
PostgreSQL·Prisma·JWT 로컬 셋업: [`backend/README.local-setup.md`](backend/README.local-setup.md)

### 웹 (React + Vite)

```bash
cd web
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```

## 패키지별 문서

| 패키지 | 상태 | 기술 스택 | 문서 |
|---|---|---|---|
| `app/` | ✅ 핵심 모바일 흐름 + 체험 모드 | React Native · Expo 54 · TypeScript | [`app/README.md`](app/README.md) |
| `backend/` | ✅ PostgreSQL 영속화 API · Render 배포 | NestJS · Prisma · PostgreSQL | [`backend/README.md`](backend/README.md) |
| `web/` | ✅ MVP | React 18 · Vite | [`web/README.md`](web/README.md) |

## Team Retour

전주를 걷고, 데이터로 검증하는 여행을 만듭니다.
