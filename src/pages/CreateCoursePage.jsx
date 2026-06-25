import { ArrowLeft, Check, MapPin, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jeonjuSpots from '../data/jeonjuSpots';
import { calculateDistanceMeters } from '../utils/geo';
import { saveUserCourse } from '../utils/courseStorage';

const THEMES = ['야경', '카페', '예술', '로컬', '시장', '자연', '음식', '역사'];

const THEME_COLORS = {
  야경: ['#0f766e', '#172554'],
  카페: ['#166534', '#1e3a8a'],
  예술: ['#047857', '#1d4ed8'],
  로컬: ['#15803d', '#1e40af'],
  시장: ['#0f766e', '#1e40af'],
  자연: ['#065f46', '#1e3a8a'],
  음식: ['#b45309', '#7c2d12'],
  역사: ['#1d4ed8', '#0f5b3a'],
};

function buildCourseImage(title, theme) {
  const [accent, sub] = THEME_COLORS[theme] ?? ['#13315c', '#0f8b6d'];
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
      <text x="70" y="150" font-size="42" font-family="Arial, sans-serif" fill="white" opacity="0.88">MY TRIPICK</text>
      <text x="70" y="320" font-size="80" font-weight="700" font-family="Arial, sans-serif" fill="white">${label}</text>
      <text x="70" y="405" font-size="34" font-family="Arial, sans-serif" fill="white" opacity="0.9">User Created Course</text>
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

function CreateCoursePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [selectedSpots, setSelectedSpots] = useState([]);

  const toggleSpot = (spot) => {
    setSelectedSpots((prev) =>
      prev.find((s) => s.id === spot.id)
        ? prev.filter((s) => s.id !== spot.id)
        : [...prev, spot],
    );
  };

  const isValid = title.trim().length > 0 && theme !== '' && selectedSpots.length >= 2;

  const handleSave = () => {
    if (!isValid) return;
    const trimmedTitle = title.trim();
    const now = Date.now();
    const newCourse = {
      id: `user-${now}`,
      title: trimmedTitle,
      area: '전주',
      theme,
      distance: computeDistance(selectedSpots),
      spotCount: selectedSpots.length,
      completionRate: 0,
      averageRating: 0,
      performers: 0,
      imageUrl: buildCourseImage(trimmedTitle, theme),
      spots: selectedSpots.map((s, i) => ({
        id: `uc-${now}-${i}`,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        visited: false,
      })),
      isUserCreated: true,
    };
    saveUserCourse(newCourse);
    navigate('/');
  };

  return (
    <div className="page page--create">
      <div className="create-nav">
        <button className="icon-button" onClick={() => navigate(-1)} aria-label="뒤로">
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>New Course</p>
          <h1 className="create-nav__title">내 코스 만들기</h1>
        </div>
      </div>

      <div className="create-form">
        <div className="form-group">
          <label className="form-label" htmlFor="course-title">코스 이름</label>
          <input
            id="course-title"
            className="form-input"
            type="text"
            placeholder="예: 전동성당 야경 코스"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
          />
        </div>

        <div className="form-group">
          <p className="form-label">테마</p>
          <div className="theme-picker">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`theme-btn${theme === t ? ' theme-btn--active' : ''}`}
                onClick={() => setTheme(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <p className="form-label">
            장소 선택{' '}
            <span className="form-label-sub">
              {selectedSpots.length > 0
                ? `${selectedSpots.length}곳 선택됨`
                : '최소 2곳'}
            </span>
          </p>

          {selectedSpots.length > 0 && (
            <div className="selected-spots">
              {selectedSpots.map((s, i) => (
                <span key={s.id} className="selected-spot-tag">
                  {i + 1}. {s.name}
                  <button
                    onClick={() => toggleSpot(s)}
                    aria-label={`${s.name} 제거`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="spot-picker">
            {jeonjuSpots.map((spot) => {
              const isSelected = !!selectedSpots.find((s) => s.id === spot.id);
              return (
                <button
                  key={spot.id}
                  className={`spot-pick-item${isSelected ? ' spot-pick-item--selected' : ''}`}
                  onClick={() => toggleSpot(spot)}
                >
                  <MapPin size={14} className="spot-pick-item__pin" />
                  <span className="spot-pick-item__name">{spot.name}</span>
                  <span className="spot-pick-item__cat">{spot.category}</span>
                  {isSelected && <Check size={14} className="spot-pick-item__check" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sticky-action">
        <button className="primary-button" disabled={!isValid} onClick={handleSave}>
          <Plus size={18} />
          코스 저장하기
        </button>
      </div>
    </div>
  );
}

export default CreateCoursePage;
