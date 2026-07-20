# TRIPICK

실제 수행 데이터를 기반으로 검증된 여행 코스를 랭킹화하는 **참여형 관광 플랫폼**입니다.

## 모노레포 구조

```
tripick/
├── web/        # React + Vite 웹 MVP (현재 구현됨)
├── app/        # React Native + Expo 앱 (진행 중)
├── backend/    # NestJS API 서버 — TourAPI 프록시 (초기 구축 완료)
└── README.md   # 이 파일
```

## 웹 개발 실행

```bash
cd web
npm install
cp .env.example .env   # 키 입력 후 저장
npm run dev
```

개발 서버: `http://localhost:5173`

## 구현 현황

| 패키지 | 상태 | 기술 스택 |
|---|---|---|
| `web/` | ✅ MVP 완성 | React 18 · Vite · react-router-dom |
| `app/` | 🚧 진행 중 | React Native · Expo 54 · TypeScript |
| `backend/` | 🚧 초기 구축 완료 (TourAPI 프록시) | NestJS · TypeScript |

## 주요 기능 (web)

- 관광 코스 랭킹 및 TRIPICK Score 산정식 시각화
- Trace 수행, GPS 자동 체크인
- Smart Course Builder (여행 스타일·시간·이동 방식 기반 자동 코스 생성)
- Trust Score (코스 신뢰도 보조 지표)
- Kakao Map 연동 (키 없으면 Preview Map으로 자동 fallback)
- 한국관광공사 TourAPI v2 연동 (키 없으면 내장 mock 데이터 fallback)

자세한 내용은 [`web/README.md`](web/README.md)를 참조하세요.

## Backend 개발 실행

```bash
cd backend
npm install
cp .env.example .env   # TOUR_API_KEY 입력 (없어도 서버는 정상 기동, 관광지 API만 503 반환)
npm run start:dev
```

서버: `http://localhost:3000/api` · Swagger 문서: `http://localhost:3000/api-docs`

한국관광공사 TourAPI v2 호출은 **오직 backend에서만** 수행합니다. TourAPI 키는 `backend/.env`의 `TOUR_API_KEY`로만 관리하며, 앱이나 웹 코드에는 절대 포함하지 않습니다. 자세한 내용은 [`backend/README.md`](backend/README.md)를 참조하세요.

## 앱 개발 실행

```bash
cd app
npm install
cp .env.example .env   # EXPO_PUBLIC_API_BASE_URL 입력 (없어도 mock 데이터로 동작)
npx expo start
```

앱은 TourAPI를 직접 호출하지 않고 NestJS backend(`/api/tour/spots/jeonju`)만 호출합니다. `EXPO_PUBLIC_API_BASE_URL`이 없거나 backend 호출이 실패하면 앱은 자동으로 내장 mock 관광지 데이터로 fallback합니다.

⚠️ **실기기 연결 주의사항**: React Native 실기기(Expo Go 등)에서는 `localhost`가 기기 자신을 가리키므로 Mac에서 실행 중인 backend에 접근할 수 없습니다. Mac의 로컬 IP를 사용하세요.
```bash
# Mac 로컬 IP 확인
ipconfig getifaddr en0

# app/.env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:3000/api
```

자세한 내용은 [`app/README.md`](app/README.md)를 참조하세요.
## Backend DB Local Setup

PostgreSQL, Prisma, JWT, Course/Review/Trace API local setup is documented in [`backend/README.local-setup.md`](backend/README.local-setup.md).
