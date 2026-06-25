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
- 코스 직접 생성 및 로컬 저장
- **Smart Course Builder** — 여행 스타일·소요 시간·이동 방식 선택만으로 맞춤 코스 자동 생성

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
- 한국관광공사 TourAPI v2 (선택)

## 실행 방법
```bash
npm install
npm run dev
```

## TourAPI 설정 (선택)

API 키 없이도 내장 mock 데이터로 동작합니다. 실시간 전주 관광지 데이터를 사용하려면 아래 절차를 따르세요.

### 1. API 키 발급
1. [공공데이터포털 TourAPI](https://www.data.go.kr/data/15101578/openapi.do) 접속
2. 로그인 → **활용신청** 클릭 (심사 없이 즉시 발급)
3. 마이페이지 → OpenAPI → 활용 신청 목록에서 키 확인

### 2. `.env` 파일 생성

```bash
cp .env.example .env
```

`.env` 파일을 열고 **일반 인증키 (Decoding)** 값을 입력합니다:

```env
VITE_TOUR_API_KEY=발급받은_디코딩_키_여기에_입력
```

> ⚠️ **Decoding 키**를 사용하세요. Encoding 키(%)를 입력하면 이중 인코딩으로 인증이 실패합니다.  
> ⚠️ `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 업로드되지 않습니다.

### 3. 동작 방식

| 상태 | 동작 |
|---|---|
| API 키 설정됨 | TourAPI에서 전주 관광지·문화시설 실시간 조회 (최대 200개) |
| API 키 미설정 | 내장 mock 데이터 30개 자동 사용 |
| API 요청 실패 | 자동으로 mock 데이터로 fallback |

코스 생성 화면의 장소 선택 영역에 **TourAPI** 또는 **오프라인 데이터** 배지로 현재 데이터 출처가 표시됩니다.

### 개발 환경 CORS 처리

`vite.config.js`에 프록시가 설정되어 있어 개발 서버(`npm run dev`)에서 별도 CORS 설정 없이 동작합니다.  
프로덕션 빌드에서는 TourAPI가 지원하는 CORS 헤더로 직접 호출됩니다.

## 폴더 구조
```text
src/
  api/
    tourApi.js
  components/
    CourseCard.jsx
    ScoreBar.jsx
    BottomNav.jsx
    ReviewModal.jsx
  hooks/
    useJeonjuSpots.js
  pages/
    HomePage.jsx
    CourseDetailPage.jsx
    CreateCoursePage.jsx
    SmartCoursePage.jsx
    TracePage.jsx
  data/
    mockCourses.js
    jeonjuSpots.js
  utils/
    score.js
    geo.js
    courseStorage.js
    reviewStorage.js
  App.jsx
  main.jsx
  index.css
```

### 구조 설명
- `api/tourApi.js`: 한국관광공사 TourAPI v2 호출 및 응답 정규화
- `hooks/useJeonjuSpots.js`: TourAPI + mock fallback을 추상화한 커스텀 훅
- `components/`: 카드, 점수 바, 하단 네비게이션, 리뷰 모달, 코스 지도 UI
- `pages/`: 홈, 코스 상세, 코스 생성, Smart 자동 생성, Trace 수행 화면
- `data/mockCourses.js`: 전주 기반 코스 목데이터
- `data/jeonjuSpots.js`: TourAPI 미설정 시 fallback으로 사용할 전주 관광지 30곳
- `utils/score.js`: TRIPICK 점수 산정 로직
- `utils/geo.js`: GPS 거리 계산 및 자동 체크인 구조
- `utils/courseStorage.js`: 사용자 코스 localStorage CRUD 및 통합 조회
- `utils/reviewStorage.js`: 방문자 평가 localStorage CRUD 및 평균 별점 계산

## Smart Course Builder

`/smart` 경로에서 접근할 수 있으며, 하단 네비게이션의 **Smart** 탭으로 바로 진입할 수 있습니다.

### 사용 방법
1. **여행 스타일** 선택 (감성 / 역사 / 야경 / 먹거리 / 자연 / 로컬)
2. **소요 시간** 선택 (짧은 코스 3곳 / 반나절 5곳 / 하루 7곳)
3. **이동 방식** 선택 (도보 / 대중교통 / 자전거)
4. **코스 자동 생성하기** 클릭

선택한 스타일에 매핑된 카테고리(`감성 → 카페·예술·로컬` 등)로 관광지를 필터링하고,
필터 결과가 목표 수에 미치지 못할 경우 전체 관광지에서 자동 보충합니다.
생성된 코스는 **이 코스 저장하기** 버튼으로 localStorage에 저장되며,
홈 화면 **내가 만든 코스** 섹션에 즉시 표시됩니다.

## CourseMap (Mock 지도)

`src/components/CourseMap.jsx`는 외부 지도 API 없이 동작하는 순수 CSS + SVG 기반 지도 컴포넌트입니다.

- **현재**: spot의 `lat`/`lng` 좌표를 바운딩 박스 기준으로 정규화하여 카드 안에 마커를 배치합니다.
- **마커 상태**: 기본(네이비) / 현재 목표(초록, glow) / 방문 완료(파랑) / 내 위치(빨강)
- **코스 경로**: 장소 간 점선 연결
- **향후 계획**: Kakao Map API 또는 Naver Map API로 교체 예정

### GPS 체크인 구조

TracePage에서 `navigator.geolocation.getCurrentPosition`을 사용합니다.

| 버튼 | 동작 |
|---|---|
| 내 위치 갱신 | 현재 GPS 위치를 가져와 지도에 표시, 목적지까지 거리 계산 |
| GPS 자동 체크인 | 위치 확인 후 50m 이내면 자동 체크인 |
| 현재 지점 체크인 | GPS 없이 수동 체크인 (개발/테스트 편의용) |

GPS 권한이 거부되면 앱은 깨지지 않고, 지도 하단에 에러 메시지를 표시합니다.

## 구현 메모
- 백엔드 없이 목데이터 기반으로 동작합니다.
- `navigator.geolocation` 구조를 포함했고, 개발 편의를 위해 수동 체크인 버튼도 제공합니다.
- Trace 진행 상태는 `localStorage`에 저장되어 새로고침 후에도 유지됩니다.
- 데스크탑에서는 가운데 모바일 프레임 형태로 보이도록 `max-width`를 적용했습니다.
- 사용자가 생성한 코스는 `localStorage`(`tripick_user_courses`)에 저장되며, 홈 화면 "내가 만든 코스" 섹션에 표시됩니다.
- 코스 생성 시 선택한 장소 간 직선 거리를 합산하여 예상 거리를 자동 계산합니다.
- `CourseMap`은 현재 mock 지도로, Kakao Map API 연동 시 이 컴포넌트만 교체하면 됩니다.

## 향후 개발 계획
- 실제 GPS 자동 체크인
- 사용자 로그인
- 백엔드 및 DB 연동
- TourAPI 키워드/위치 기반 검색 확장

## GitHub 업로드 명령어
```bash
git init
git add .
git commit -m "Initial TRIPICK MVP"
git branch -M main
git remote add origin <깃허브_레포_URL>
git push -u origin main
```
