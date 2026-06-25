import { MapPinned, Star, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { calculateTripickScore } from '../utils/score';

function CourseCard({ course, rank }) {
  const { totalScore } = calculateTripickScore(course);

  return (
    <Link className="course-card" to={`/courses/${course.id}`}>
      <div
        className="course-card__image"
        style={{ backgroundImage: `url(${course.imageUrl})` }}
      >
        <div className="course-card__badge">
          {rank ? `TOP ${rank}` : 'MY'}
        </div>
      </div>
      <div className="course-card__body">
        <div className="course-card__header">
          <div>
            <h3>{course.title}</h3>
            <p>
              {course.area} · {course.theme}
            </p>
          </div>
          <div className="course-card__score">
            <span>Score</span>
            <strong>{totalScore}</strong>
          </div>
        </div>
        <div className="course-card__metrics">
          <span>
            <Target size={15} />
            완주율 {course.completionRate}%
          </span>
          <span>
            <Star size={15} />
            만족도 {course.averageRating}
          </span>
          <span>
            <Users size={15} />
            수행자 {course.performers}
          </span>
          <span>
            <MapPinned size={15} />
            {course.spotCount}개 지점
          </span>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
