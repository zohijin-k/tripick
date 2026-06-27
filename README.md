# TRIPICK

실제 수행 데이터를 기반으로 검증된 여행 코스를 랭킹화하는 **참여형 관광 플랫폼**입니다.

## 모노레포 구조

```
tripick/
├── web/        # React + Vite 웹 MVP (현재 구현됨)
├── app/        # React Native + Expo 앱 (예정)
├── backend/    # NestJS 또는 Spring Boot API 서버 (예정)
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
| `app/` | 🚧 진행 중 | React Native · Expo 51 · TypeScript |
| `backend/` | 🔜 예정 | NestJS / Spring Boot |

## 주요 기능 (web)

- 관광 코스 랭킹 및 TRIPICK Score 산정식 시각화
- Trace 수행, GPS 자동 체크인
- Smart Course Builder (여행 스타일·시간·이동 방식 기반 자동 코스 생성)
- Trust Score (코스 신뢰도 보조 지표)
- Kakao Map 연동 (키 없으면 Preview Map으로 자동 fallback)
- 한국관광공사 TourAPI v2 연동 (키 없으면 내장 mock 데이터 fallback)

자세한 내용은 [`web/README.md`](web/README.md)를 참조하세요.

## 앱 개발 실행

```bash
cd app
npm install
npx expo start
```

자세한 내용은 [`app/README.md`](app/README.md)를 참조하세요.
