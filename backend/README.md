# TRIPICK Backend

API 서버 (예정)

## 역할

웹/앱의 localStorage 기반 MVP를 서버 기반으로 전환하여 다음을 담당합니다.

- 코스 데이터 영속화 (DB)
- TRIPICK Score / Trust Score 서버 사이드 계산
- 랭킹 API
- 리뷰 / 평가 API
- 한국관광공사 TourAPI v2 중계 (CORS 우회, 캐싱)
- 사용자 인증 (JWT)

## API 설계 (예정)

| Method | Path | 설명 |
|---|---|---|
| GET | `/courses` | 코스 목록 (랭킹순) |
| GET | `/courses/:id` | 코스 상세 |
| POST | `/courses` | 코스 생성 |
| GET | `/courses/:id/reviews` | 리뷰 목록 |
| POST | `/courses/:id/reviews` | 리뷰 작성 |
| POST | `/courses/:id/trace` | Trace 수행 기록 |
| GET | `/spots` | 전주 관광지 목록 (TourAPI 중계) |

## 기술 스택 (예정)

- **NestJS** 또는 **Spring Boot 3**
- PostgreSQL
- Prisma (NestJS 채택 시) / JPA (Spring Boot 채택 시)
- Redis (랭킹 캐싱)

## 시작하기

```bash
# 추후 추가 예정
cd backend
npm install       # NestJS 기준
npm run start:dev
```
