import { ArrowLeft, Check, Loader2, MapPin, RefreshCw, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJeonjuSpots } from '../hooks/useJeonjuSpots';
import { saveUserCourse } from '../utils/courseStorage';
import { calculateDistanceMeters } from '../utils/geo';
import { generateRecommendationReasons } from '../utils/recommendation';

const STYLE_OPTIONS = ['감성', '역사', '야경', '먹거리', '자연', '로컬'];
const DURATION_OPTIONS = ['짧은 코스', '반나절', '하루'];
const TRANSPORT_OPTIONS = ['도보', '대중교통', '자전거'];

const STYLE_CATEGORIES = {
  감성: ['카페', '예술', '로컬'],
  역사: ['역사', '문화시설'],
  야경: ['야경', '시장', '자연'],
  먹거리: ['음식', '시장'],
  자연: ['자연', '산책'],
  로컬: ['로컬', '시장', '예술'],
};

const DURATION_SPOT_COUNT = {
  '짧은 코스': 3,
  반나절: 5,
  하루: 7,
};

const STYLE_COLORS = {
  감성: ['#7c3aed', '#db2777'],
  역사: ['#1d4ed8', '#0f5b3a'],
  야경: ['#0f766e', '#172554'],
  먹거리: ['#b45309', '#7c2d12'],
  자연: ['#065f46', '#1e3a8a'],
  로컬: ['#15803d', '#1e40af'],
};

function buildCourseImage(title, style) {
  const [accent, sub] = STYLE_COLORS[style] ?? ['#13315c', '#0f8b6d'];
  const label = title.length > 12 ? title.slice(0, 12) + '…' : title;
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${sub}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)" />
      <circle cx="980" cy="180" r="140" fill="rgba(255,255,255,0.18)" />
      <circle cx="210" cy="620" r="180" fill="rgba(255,255,255,0.12)" />
      <text x="70" y="150" font-size="42" font-family="Arial, sans-serif" fill="white" opacity="0.88">SMART TRIPICK</text>
      <text x="70" y="320" font-size="80" font-weight="700" font-family="Arial, sans-serif" fill="white">${label}</text>
      <text x="70" y="405" font-size="34" font-family="Arial, sans-serif" fill="white" opacity="0.9">Auto-Generated Course</text>
      <rect x="70" y="470" width="420" height="10" rx="5" fill="rgba(255,255,255,0.28)" />
    </svg>
  `)}`;
}

function computeDistance(spots) {
  if (spots.length < 2) return '0km';
  let total = 0;
  for (let i = 1; i < spots.length; i++) {
    total += calculateDistanceMeters(spots[i - 1], spots[i]);
  }
  return `${(total / 1000).toFixed(1)}km`;
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function SmartCoursePage() {
  const navigate = useNavigate();
  const { spots, loading, source } = useJeonjuSpots();
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('');
  const [transport, setTransport] = useState('');
  const [generatedCourse, setGeneratedCourse] = useState(null);
  const [saved, setSaved] = useState(false);

  const canGenerate = style !== '' && duration !== '' && transport !== '' && !loading;

  const handleGenerate = () => {
    if (!canGenerate) return;

    const targetCount = DURATION_SPOT_COUNT[duration];
    const categories = STYLE_CATEGORIES[style] ?? [];

    const filtered = shuffleArray(spots.filter((s) => categories.includes(s.category)));
    const remaining = shuffleArray(spots.filter((s) => !categories.includes(s.category)));

    const selected = [...filtered, ...remaining].slice(0, targetCount);

    const now = Date.now();
    const title = `${style} ${duration} 전주 코스`;
    const firstImageUrl = selected[0]?.imageUrl ?? '';
    const recommendationReasons = generateRecommendationReasons(selected, {
      style,
      duration,
      transport,
    });

    setGeneratedCourse({
      id: `smart-${now}`,
      title,
      area: '전주',
      theme: style,
      distance: computeDistance(selected),
      spotCount: selected.length,
      completionRate: 0,
      averageRating: 0,
      performers: 0,
      imageUrl: firstImageUrl || buildCourseImage(title, style),
      spots: selected.map((s, i) => ({
        id: `sc-${now}-${i}`,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        visited: false,
      })),
      isUserCreated: true,
      transport,
      recommendationReasons,
    });
    setSaved(false);
  };

  const handleSave = () => {
    if (!generatedCourse || saved) return;
    saveUserCourse(generatedCourse);
    setSaved(true);
  };

  return (
    <div className="page page--smart">
      <div className="create-nav">
        <button className="icon-button" onClick={() => navigate(-1)} aria-label="뒤로">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Smart Builder</p>
          <h1 className="create-nav__title">자동 코스 생성</h1>
        </div>
      </div>

      {!generatedCourse ? (
        <div className="smart-form">
          {!loading && (
            <p className="smart-source-hint">
              {source === 'api'
                ? `TourAPI 데이터 기반 · ${spots.length}개 관광지`
                : '오프라인 데이터 기반'}
            </p>
          )}

          <div className="form-group">
            <p className="form-label">여행 스타일</p>
            <div className="theme-picker">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  className={`theme-btn${style === s ? ' theme-btn--active' : ''}`}
                  onClick={() => setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <p className="form-label">소요 시간</p>
            <div className="theme-picker">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d}
                  className={`theme-btn${duration === d ? ' theme-btn--active' : ''}`}
                  onClick={() => setDuration(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <p className="form-label">이동 방식</p>
            <div className="theme-picker">
              {TRANSPORT_OPTIONS.map((t) => (
                <button
                  key={t}
                  className={`theme-btn${transport === t ? ' theme-btn--active' : ''}`}
                  onClick={() => setTransport(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky-action">
            {loading ? (
              <button className="primary-button" disabled>
                <Loader2 size={18} className="spin" />
                관광지 불러오는 중...
              </button>
            ) : (
              <button className="primary-button" disabled={!canGenerate} onClick={handleGenerate}>
                <Sparkles size={18} />
                코스 자동 생성하기
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="smart-result">
          <div className="smart-result__card">
            <div
              className="smart-result__image"
              style={{ backgroundImage: `url("${generatedCourse.imageUrl}")` }}
            />
            <div className="smart-result__body">
              <div className="smart-result__badges">
                <span className="smart-badge smart-badge--style">{generatedCourse.theme}</span>
                <span className="smart-badge smart-badge--transport">{transport}</span>
              </div>
              <h2 className="smart-result__title">{generatedCourse.title}</h2>
              <div className="smart-result__stats">
                <span>{generatedCourse.spotCount}개 장소</span>
                <span>{generatedCourse.distance}</span>
                <span>{duration}</span>
              </div>
            </div>
          </div>

          <section className="section section--compact">
            <div className="section__header">
              <div>
                <p className="section__eyebrow">Course Spots</p>
                <h2>코스 장소</h2>
              </div>
              <span className="section__count">{generatedCourse.spotCount}개</span>
            </div>
            <div className="spot-list">
              {generatedCourse.spots.map((spot, i) => (
                <div key={spot.id} className="spot-item">
                  <div className="spot-item__index">{i + 1}</div>
                  <div className="spot-item__body">
                    <strong>{spot.name}</strong>
                    {generatedCourse.recommendationReasons?.[i] && (
                      <span className="spot-reason">
                        {generatedCourse.recommendationReasons[i]}
                      </span>
                    )}
                  </div>
                  <MapPin size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </section>

          <div className="smart-actions">
            <button className="primary-button" onClick={handleSave} disabled={saved}>
              {saved ? (
                <>
                  <Check size={18} />
                  저장 완료
                </>
              ) : (
                <>
                  <Save size={18} />
                  이 코스 저장하기
                </>
              )}
            </button>
            {saved && (
              <button className="secondary-button" onClick={() => navigate('/')}>
                홈에서 확인하기
              </button>
            )}
            <button
              className="ghost-button"
              onClick={() => { setGeneratedCourse(null); setSaved(false); }}
            >
              <RefreshCw size={16} />
              다시 생성하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartCoursePage;
