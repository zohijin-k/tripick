# 🧭 TRIPICK

> **Verify. Travel. Trust.**
>
> AI와 관광데이터를 활용한 사용자 참여형 관광 코스 검증 플랫폼

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)
![TourAPI](https://img.shields.io/badge/TourAPI-KTO-blue)
![KakaoMap](https://img.shields.io/badge/Kakao_Map-API-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

---

# 📖 프로젝트 소개

TRIPICK은 **한국관광공사 TourAPI**와 **사용자 실제 수행 데이터(GPS, 리뷰, 완주율)**를 결합하여 **신뢰할 수 있는 관광 코스**를 제공하는 참여형 관광 플랫폼입니다.

기존 관광 서비스는 단순히 관광지를 추천하는 데 그치지만,

TRIPICK은

- 사용자가 직접 코스를 생성하고
- 다른 사용자가 실제로 수행하며
- GPS와 리뷰 데이터를 기반으로 검증하고
- 검증된 코스를 다시 추천하는

**데이터 선순환 구조**를 제공합니다.

---

# 🚀 핵심 기능

## 🏆 관광 코스 랭킹

- 검증된 관광 코스 TOP 랭킹
- TRIPICK Score 제공
- Trust Score 제공

---

## 🤖 Smart Course Builder

사용자가

- 여행 스타일
- 이동 방식
- 여행 시간

을 선택하면

TourAPI 관광 데이터를 기반으로

자동으로 관광 코스를 생성합니다.

---

## 🗺 Kakao Map

- 실제 관광지 위치 표시
- 관광 코스 시각화
- GPS 기반 현재 위치 표시
- Preview Map 자동 fallback 지원

---

## 📍 GPS Check-in

실제 방문 위치를 확인하여

코스 수행 여부를 기록합니다.

---

## ⭐ 리뷰 시스템

- 별점 평가
- 한 줄 후기
- 평균 별점 자동 계산
- TRIPICK Score 반영

---

## 🛡 Trust Score

단순 별점이 아닌

- 완주율
- 수행자 수
- GPS 검증
- 리뷰
- 관광데이터 품질

을 종합하여

코스 신뢰도를 계산합니다.

---

## 💡 Recommendation Reason

자동 생성된 코스에 대해

> 왜 이 관광지를 추천했는지

사용자에게 설명합니다.

---

# 🔄 서비스 흐름

```text
TourAPI
      │
      ▼
Smart Course Builder
      │
      ▼
Course Creation
      │
      ▼
Trace (GPS)
      │
      ▼
Review
      │
      ▼
Trust Score
      │
      ▼
Ranking
```

---

# 🏗 프로젝트 구조

```
src
│
├── api
│   └── tourApi.js
│
├── components
│   ├── BottomNav
│   ├── CourseCard
│   ├── CourseMap
│   ├── KakaoCourseMap
│   ├── MapWrapper
│   ├── ReviewModal
│   └── ScoreBar
│
├── data
│
├── hooks
│   └── useJeonjuSpots
│
├── pages
│   ├── HomePage
│   ├── CourseDetailPage
│   ├── TracePage
│   ├── CreateCoursePage
│   └── SmartCoursePage
│
├── utils
│   ├── geo
│   ├── score
│   ├── trustScore
│   ├── recommendation
│   ├── courseStorage
│   └── reviewStorage
│
└── App.jsx
```

---

# ⚙ 기술 스택

## Frontend

- React
- Vite
- React Router

## API

- 한국관광공사 TourAPI
- Kakao Map JavaScript SDK
- Browser Geolocation API

## Storage

- LocalStorage

---

# 📦 실행 방법

```bash
git clone https://github.com/zohijin-k/tripick.git

cd tripick

npm install

cp .env.example .env

npm run dev
```

---

# 🔑 환경변수

`.env`

```
VITE_TOUR_API_KEY=YOUR_TOUR_API_KEY

VITE_KAKAO_MAP_KEY=YOUR_KAKAO_JS_KEY
```

`.env`는 GitHub에 업로드하지 않습니다.

---

# 📷 주요 화면

- Home
- Smart Course Builder
- Course Detail
- GPS Trace
- Review
- Kakao Map

(스크린샷 추가 예정)

---

# 🛣 Roadmap

- [x] TourAPI 연동
- [x] Smart Course Builder
- [x] GPS Check-in
- [x] Kakao Map
- [x] Review System
- [x] Recommendation Reason
- [x] Trust Score

### Next

- FastAPI Backend
- Database
- Authentication
- Community
- AI Recommendation
- XR Travel Experience

---

# 👥 Contributors

| Name | Role |
|------|------|
| **조이진** | PM · Frontend · Planning · TourAPI · Git |
| **황선우** | Backend |
| **위지우** | UI Design · Research |

---

# 🏆 Project

2026 관광데이터 활용 공모전

**TRIPICK**
> Verify. Travel. Trust.

AI × TourAPI × GPS × Trust Score