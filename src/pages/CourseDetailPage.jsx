import { ChevronRight, MapPinned, Route, Sparkles, Star } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ScoreBar from '../components/ScoreBar';
import mockCourses from '../data/mockCourses';
import { calculateTripickScore } from '../utils/score';

function CourseDetailPage() {
  const { courseId } = useParams();
  const course = mockCourses.find((item) => item.id === courseId);

  if (!course) {
    return <Navigate to="/" replace />;
  }

  const { totalScore, performerScore, ratingScore } = calculateTripickScore(course);

  return (
    <div className="page">
      <section className="detail-hero">
        <div
          className="detail-hero__image"
          style={{ backgroundImage: `url(${course.imageUrl})` }}
        />
        <div className="detail-hero__content">
          <p className="eyebrow">Course Detail</p>
          <h1>{course.title}</h1>
          <div className="detail-hero__meta">
            <span>{course.area}</span>
            <span>{course.theme}</span>
            <span>{course.distance}</span>
            <span>{course.spotCount}개 지점</span>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="score-panel">
          <div className="score-panel__headline">
            <div>
              <p className="section__eyebrow">TRIPICK Score</p>
              <h2>{totalScore}</h2>
            </div>
            <Sparkles size={22} />
          </div>
          <p className="formula">
            Score = 0.5 x 완주율 + 0.3 x (평균 만족도 / 5 x 100) + 0.2 x 수행자 수 점수
          </p>
          <ScoreBar label="완주율 50%" value={course.completionRate} tone="green" />
          <ScoreBar label="만족도 30%" value={ratingScore} tone="navy" />
          <ScoreBar label="수행자 수 20%" value={performerScore} tone="mint" />
        </div>
      </section>

      <section className="section section--compact">
        <div className="info-grid">
          <div className="info-chip">
            <Route size={18} />
            <div>
              <span>거리</span>
              <strong>{course.distance}</strong>
            </div>
          </div>
          <div className="info-chip">
            <MapPinned size={18} />
            <div>
              <span>지점 수</span>
              <strong>{course.spotCount}곳</strong>
            </div>
          </div>
          <div className="info-chip">
            <Star size={18} />
            <div>
              <span>평균 만족도</span>
              <strong>{course.averageRating} / 5</strong>
            </div>
          </div>
          <div className="info-chip">
            <Sparkles size={18} />
            <div>
              <span>수행자 수</span>
              <strong>{course.performers}명</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--compact">
        <div className="section__header">
          <div>
            <p className="section__eyebrow">Course Spots</p>
            <h2>코스 지점 목록</h2>
          </div>
        </div>

        <div className="spot-list">
          {course.spots.map((spot, index) => (
            <div className="spot-item" key={spot.id}>
              <div className="spot-item__index">{index + 1}</div>
              <div className="spot-item__body">
                <strong>{spot.name}</strong>
                <span>
                  위도 {spot.lat}, 경도 {spot.lng}
                </span>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </section>

      <div className="sticky-action">
        <Link className="primary-button" to={`/trace/${course.id}`}>
          이 코스 수행하기
        </Link>
      </div>
    </div>
  );
}

export default CourseDetailPage;
