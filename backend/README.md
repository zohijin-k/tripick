# TRIPICK Backend

NestJS + TypeScript 기반 API 서버. 이번 스프린트의 핵심은 **NestJS 초기 구축과 TourAPI 프록시 완성**입니다 — 앱(RN)과 웹(Vite)이 TourAPI 키를 직접 다루지 않도록, 한국관광공사 TourAPI 호출을 이 서버 하나로 모읍니다.

## 역할

웹/앱의 localStorage·AsyncStorage 기반 MVP를 서버 기반으로 전환하는 것이 최종 목표입니다.

- 한국관광공사 TourAPI v2 중계 (CORS 우회, 키 서버 사이드 관리) — **구현 완료**
- 코스 데이터 영속화 (DB), TRIPICK Score/Trust Score 서버 사이드 계산, 랭킹 API, 리뷰/평가 API, 사용자 인증(JWT) — **예정** (다음 스프린트)

## 실행 방법

```bash
cd backend
npm install
cp .env.example .env   # TOUR_API_KEY 입력
npm run start:dev
```

- 서버: `http://localhost:3000/api`
- Swagger 문서: `http://localhost:3000/api-docs`
- `TOUR_API_KEY`가 없어도 서버는 정상 기동합니다. `/api/tour/spots/jeonju`만 503을 반환하고, `/api/health`는 정상 동작합니다.

기타 스크립트:

```bash
npm run build        # dist/ 로 빌드
npm run start:prod    # 빌드 결과 실행
```

## 환경 변수 (`.env.example`)

| 변수 | 설명 |
|---|---|
| `PORT` | 서버 포트 (기본값 3000) |
| `TOUR_API_KEY` | 한국관광공사 TourAPI v2 서비스 키. **일반 인증키 (Decoding)** 사용 필수 — axios가 요청 시 자동으로 1회 인코딩하므로, 이미 인코딩된 키를 넣으면 이중 인코딩으로 인증이 실패합니다. |
| `TOUR_API_BASE_URL` | TourAPI 베이스 URL (기본값 `https://apis.data.go.kr/B551011/KorService2`) |
| `CORS_ORIGINS` | 콤마로 구분된 허용 Origin 목록 (선택). 비워두면 개발 환경에서는 전체 허용됩니다. |

⚠️ `backend/.env`는 루트 `.gitignore`에 포함되어 있어 절대 커밋되지 않습니다. TourAPI 키는 **이 서버에서만** 관리하며, 앱/웹 코드에는 절대 포함하지 않습니다.

## 폴더 구조

```
backend/
├── src/
│   ├── main.ts              # bootstrap — CORS, 글로벌 prefix(/api), ValidationPipe, Swagger(/api-docs)
│   ├── app.module.ts
│   ├── common/
│   │   └── health/          # GET /api/health
│   ├── config/
│   │   ├── configuration.ts       # 환경변수 → AppConfig 매핑 (ConfigModule)
│   │   └── jeonju.constants.ts    # 전주 지역코드(areaCode/sigunguCode), 기본 contentTypeId
│   └── tour/                # TourAPI 프록시 모듈
│       ├── tour.module.ts
│       ├── tour.controller.ts     # GET /api/tour/spots/jeonju
│       ├── tour.service.ts        # TourAPI 호출 + 정규화 + 에러 처리
│       ├── dto/get-jeonju-spots-query.dto.ts
│       ├── interfaces/tour-spot.interface.ts
│       └── mappers/tour-spot.mapper.ts
├── package.json
├── tsconfig.json / tsconfig.build.json
├── nest-cli.json
└── .env.example
```

## API

### `GET /api/health`

```json
{ "status": "ok", "service": "tripick-backend" }
```

### `GET /api/tour/spots/jeonju`

전주(전북특별자치도 37 / 전주시 12) 관광지(`12`)·문화시설(`14`) 데이터를 TourAPI `areaBasedList2`에서 병렬 조회해 정규화한 뒤 반환합니다.

Query:

| 파라미터 | 기본값 | 설명 |
|---|---|---|
| `contentTypes` | `12,14` | 콤마로 구분된 TourAPI contentTypeId 목록 |
| `page` | `1` | 페이지 번호 |
| `pageSize` | `50` | 페이지당 개수 (최대 100) |

성공 응답:

```json
{
  "source": "tourapi",
  "count": 25,
  "spots": [
    {
      "id": "126508",
      "name": "전동성당",
      "category": "역사",
      "lat": 35.8142,
      "lng": 127.148,
      "address": "전북 전주시 완산구 태조로 51",
      "imageUrl": null,
      "contentId": "126508",
      "contentTypeId": "12"
    }
  ]
}
```

TourAPI 키 미설정 또는 외부 API 호출 실패 시 (서버는 종료되지 않고, 키는 절대 노출되지 않습니다):

```json
{ "message": "TourAPI 데이터를 가져올 수 없습니다." }
```
→ HTTP `503 Service Unavailable`

정규화 규칙: `contentid → id/contentId`, `title → name`, `mapy → lat`, `mapx → lng`, `addr1 → address`, `firstimage`/`firstimage2` → `imageUrl`, `contenttypeid → contentTypeId`, `cat1/cat2 → category`(자연/역사/예술/로컬/시장/음식/관광지). 좌표가 없거나 숫자로 변환 불가능한 항목은 제외하고, `contentId` 중복 항목은 제거합니다.

## Swagger

`http://localhost:3000/api-docs` 에서 확인할 수 있습니다. Tour API의 query parameter 설명, 성공/오류 응답 예시(`503`, `400`)를 포함합니다.

## CORS

`main.ts`에서 개발 환경은 `CORS_ORIGINS`가 비어 있으면 모든 origin을 허용해 React Native(Expo)와 웹 MVP 양쪽에서 접근할 수 있도록 합니다. 배포 시에는 `CORS_ORIGINS`(콤마 구분)로 허용 도메인을 제한하세요.

## 기술 스택

| 항목 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | NestJS 11 | |
| 언어 | TypeScript | |
| 외부 API 호출 | `@nestjs/axios` (axios) | 병렬 요청은 `Promise.allSettled`로 일부 실패를 허용 |
| 검증 | `class-validator` / `class-transformer` | 글로벌 `ValidationPipe` |
| 문서화 | `@nestjs/swagger` + `swagger-ui-express` | |
| DB / ORM | PostgreSQL / Prisma | **다음 스프린트 예정** — 이번 스프린트에는 연결하지 않음 |
| 캐시 | Redis | **필요 시 이후 스프린트에서 추가** |
| 공간 확장 | PostGIS | **이후 적용 예정** |

## 향후 API 설계 (예정)

| Method | Path | 설명 |
|---|---|---|
| GET | `/api/courses` | 코스 목록 (랭킹순) |
| GET | `/api/courses/:id` | 코스 상세 |
| POST | `/api/courses` | 코스 생성 |
| GET | `/api/courses/:id/reviews` | 리뷰 목록 |
| POST | `/api/courses/:id/reviews` | 리뷰 작성 |
| POST | `/api/courses/:id/trace` | Trace 수행 기록 |
