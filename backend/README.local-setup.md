# TRIPICK Backend Local Setup

This backend now stores courses, reviews, Trace progress, GPS check-ins, and users in PostgreSQL through Prisma. The React Native app still keeps its AsyncStorage fallback for offline/local failure cases, but it tries the backend API first.

## 1. Environment

```bash
cd backend
cp .env.example .env
```

Required values:

```env
PORT=3000
DATABASE_URL=postgresql://tripick:tripick@localhost:5432/tripick?schema=public
JWT_SECRET=replace_with_long_random_secret
TOUR_API_KEY=your_decoding_tour_api_key
TOUR_API_BASE_URL=https://apis.data.go.kr/B551011/KorService2
CORS_ORIGINS=
```

Use the TourAPI 일반 인증키(Decoding). Do not use the encoded service key.

## 2. Start PostgreSQL

With Docker:

```bash
cd backend
docker compose up -d
```

If you use an existing local PostgreSQL installation, update `DATABASE_URL` instead.

### Production PostgreSQL (Neon)

Production uses an external Neon PostgreSQL database so it is not tied to Render's time-limited free database. Create a Neon project, copy its pooled connection string, and set it as the Render web service's `DATABASE_URL` secret. Keep `sslmode=require` in the URL.

`render.yaml` intentionally declares `DATABASE_URL` with `sync: false`. Never commit the real connection string or paste it into an app-side `.env` file.

After creating or changing the production database, sync the schema and seed the initial public courses once:

```bash
cd backend
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"
npm run prisma:generate
npm run db:push
npm run db:seed
```

Neon's free plan has usage limits and may suspend idle compute, but unlike Render's former free PostgreSQL offering it does not have a fixed 30-day database expiration. Provider policies can change, so export a backup before future provider changes.

## 3. Generate Prisma Client And Sync Schema

```bash
cd backend
npm install
npm run prisma:generate
npm run db:push
```

`db:push` applies `prisma/schema.prisma` directly to the local database. That is intentional for the current MVP speed; formal migrations can be added later.

## 4. Start Backend

```bash
cd backend
npm run start:dev
```

Useful URLs:

- API: `http://localhost:3000/api`
- Health: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api-docs`

## 5. Connect The App

`app/.env` should point to the backend:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

For Expo Go on a physical phone, use the PC's LAN IP instead of `localhost`:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:3000/api
```

## Implemented APIs

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Email/password signup |
| POST | `/api/auth/login` | Login and JWT issue |
| POST | `/api/auth/dev-login` | Local app development auto-login |
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/me` | Save nickname and travel preferences |
| DELETE | `/api/auth/me` | Permanently delete the current account and owned data |
| GET | `/api/courses` | Course list/ranking |
| GET | `/api/courses/nearby?lat=...&lng=...` | Nearby courses ordered by distance and profile preference |
| GET | `/api/courses/my` | My created courses |
| GET | `/api/courses/:id` | Course detail |
| POST | `/api/courses` | Create/save course |
| GET | `/api/courses/:id/reviews` | Review list |
| POST | `/api/courses/:id/reviews` | Create one review per user; GPS completion determines verification weight |
| GET | `/api/courses/:id/trace` | My Trace progress |
| POST | `/api/courses/:id/checkins` | GPS check-in; rejects manual requests and locations over 50m away |
| POST | `/api/courses/:id/trace/complete` | Complete course trace |

## Trust Score Data Semantics

- Completion rate is completed trace sessions divided by started trace sessions.
- Performer count is the number of users who started a trace, not only users who completed it.
- Review trust uses GPS-completed review ratio, sample volume, and rating consistency.
- GPS verification uses server-validated automatic check-ins within 50m.
- Data quality is the fill ratio for coordinates, address, image, TourAPI content ID, and category.
