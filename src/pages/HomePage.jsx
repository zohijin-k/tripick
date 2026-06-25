import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import CourseCard from '../components/CourseCard';
import mockCourses from '../data/mockCourses';
import { getUserCourses } from '../utils/courseStorage';
import { calculateTripickScore } from '../utils/score';

function HomePage() {
  const [query, setQuery] = useState('');

  const rankedCourses = useMemo(() => {
    return [...mockCourses]
      .map((course) => ({
        ...course,
        calculatedScore: calculateTripickScore(course).totalScore,
      }))
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }, []);

  const userCourses = useMemo(() => getUserCourses(), []);

  const matchesQuery = (course) => {
    const target = `${course.title} ${course.area} ${course.theme}`.toLowerCase();
    return target.includes(query.toLowerCase());
  };

  const topFive = rankedCourses.filter(matchesQuery).slice(0, 5);
  const filteredUserCourses = userCourses.filter(matchesQuery);

  return (
    <div className="page page--home">
      <section className="hero">
        <p className="eyebrow">Participatory Tourism Ranking</p>
        <h1>TRIPICK</h1>
        <p className="hero__description">
          전주에서 실제로 수행된 코스를 기반으로, 더 믿을 수 있는 여행 선택을
          돕는 참여형 관광 플랫폼입니다.
        </p>
        <label className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="전주 코스를 검색해보세요"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>

      {filteredUserCourses.length > 0 && (
        <section className="section">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">My Courses</p>
              <h2>내가 만든 코스</h2>
            </div>
            <span className="section__count">{filteredUserCourses.length}개</span>
          </div>
          <div className="course-list">
            {filteredUserCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section__header">
          <div>
            <p className="section__eyebrow">Verified Ranking</p>
            <h2>검증된 코스 TOP 5</h2>
          </div>
          <span className="section__count">{topFive.length}개</span>
        </div>

        <div className="course-list">
          {topFive.map((course, index) => (
            <CourseCard key={course.id} course={course} rank={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
