import { ChevronRight, MapPinned, Route, Sparkles, Star } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import CourseMap from '../components/CourseMap';
import ScoreBar from '../components/ScoreBar';
import { findCourse } from '../utils/courseStorage';
import { getAverageRating, getReviewsForCourse } from '../utils/reviewStorage';
import { calculateTripickScore } from '../utils/score';

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function StarRow({ rating, size = 14 }) {
  return (
    <span className="star-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= rating ? '#f59e0b' : 'transparent'}
          stroke={i <= rating ? '#f59e0b' : '#cbd5e1'}
          strokeWidth={1.8}
        />
      ))}
    </span>
  );
}

function CourseDetailPage() {
  const { courseId } = useParams();
  const course = findCourse(courseId);

  if (!course) {
    return <Navigate to="/" replace />;
  }

  const reviews = getReviewsForCourse(courseId);
  const avgFromReviews = getAverageRating(courseId);
  // Use user review average when available; fall back to course's original rating
  const effectiveRating = avgFromReviews ?? course.averageRating;

  const { totalScore, performerScore, ratingScore } = calculateTripickScore({
    ...course,
    averageRating: effectiveRating,
  });

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
              <strong>
                {effectiveRating} / 5
                {avgFromReviews !== null && (
                  <span className="rating-badge">내 평가</span>
                )}
              </strong>
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
            <p className="section__eyebrow">Course Map</p>
            <h2>코스 지도</h2>
          </div>
        </div>
        <CourseMap spots={course.spots} />
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

      {reviews.length > 0 && (
        <section className="section section--compact">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">User Reviews</p>
              <h2>방문자 후기</h2>
            </div>
            <span className="section__count">{reviews.length}개</span>
          </div>
          <div className="review-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-item__header">
                  <StarRow rating={review.rating} />
                  <span className="review-item__score">{review.rating}.0</span>
                  <span className="review-item__date">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && (
                  <p className="review-item__comment">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="sticky-action">
        <Link className="primary-button" to={`/trace/${course.id}`}>
          이 코스 수행하기
        </Link>
      </div>
    </div>
  );
}

export default CourseDetailPage;
