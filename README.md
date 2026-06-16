# TRIPICK

## 프로젝트 소개
TRIPICK은 실제 수행 데이터를 기반으로 검증된 여행 코스를 랭킹화하는 참여형 관광 플랫폼입니다.

전주 지역 코스를 중심으로, 사용자가 만든 여행 코스를 다른 사용자가 실제로 수행하고 그 수행 데이터가 다시 랭킹에 반영되는 MVP 흐름을 React 기반으로 구현했습니다.

## 핵심 기능
- 관광 코스 랭킹
- 코스 상세 및 점수 산정식 시각화
- Trace 수행 및 체크인
- 완주율 기반 평가
- 수행자 수 기반 신뢰도 반영

## 점수 산정 방식
TRIPICK Score = 0.5 x 완주율 + 0.3 x 만족도 + 0.2 x 수행자 수 점수

세부 계산식은 아래와 같습니다.

```js
Score = 0.5 * completionRate
      + 0.3 * (averageRating / 5 * 100)
      + 0.2 * performerScore

performerScore = log10(performers + 1) / log10(100) * 100
```

## 기술 스택
- React
- Vite
- JavaScript
- react-router-dom
- lucide-react
- CSS

## 실행 방법
```bash
npm install
npm run dev
```

## 폴더 구조
```text
src/
  components/
    CourseCard.jsx
    ScoreBar.jsx
    BottomNav.jsx
  pages/
    HomePage.jsx
    CourseDetailPage.jsx
    TracePage.jsx
  data/
    mockCourses.js
  utils/
    score.js
    geo.js
  App.jsx
  main.jsx
  index.css
```

### 구조 설명
- `components/`: 카드, 점수 바, 하단 네비게이션 UI
- `pages/`: 홈, 코스 상세, Trace 수행 화면
- `data/mockCourses.js`: 전주 기반 코스 목데이터
- `utils/score.js`: TRIPICK 점수 산정 로직
- `utils/geo.js`: GPS 거리 계산 및 자동 체크인 구조

## 구현 메모
- 백엔드 없이 목데이터 기반으로 동작합니다.
- `navigator.geolocation` 구조를 포함했고, 개발 편의를 위해 수동 체크인 버튼도 제공합니다.
- Trace 진행 상태는 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.
- 데스크탑에서는 가운데 모바일 프레임 형태로 보이도록 `max-width`를 적용했습니다.

## 향후 개발 계획
- TourAPI 연동
- 실제 GPS 자동 체크인
- 사용자 로그인
- 코스 생성 기능
- 백엔드 및 DB 연동

## GitHub 업로드 명령어
```bash
git init
git add .
git commit -m "Initial TRIPICK MVP"
git branch -M main
git remote add origin <깃허브_레포_URL>
git push -u origin main
```
