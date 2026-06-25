import { Star, X } from 'lucide-react';
import { useState } from 'react';

const RATING_LABELS = {
  1: '아쉬웠어요',
  2: '별로였어요',
  3: '괜찮았어요',
  4: '좋았어요',
  5: '최고였어요!',
};

function ReviewModal({ courseTitle, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const displayRating = hoverRating || rating;

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, comment });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="닫기">
          <X size={16} />
        </button>

        <p className="section__eyebrow" style={{ margin: 0 }}>Course Review</p>
        <h2 className="modal__title">코스 완주를 축하해요!</h2>
        <p className="modal__subtitle">{courseTitle}</p>

        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              className="star-btn"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${i}점`}
            >
              <Star
                size={34}
                fill={i <= displayRating ? '#f59e0b' : 'transparent'}
                stroke={i <= displayRating ? '#f59e0b' : '#cbd5e1'}
                strokeWidth={1.8}
              />
            </button>
          ))}
        </div>

        <p className="star-label">
          {displayRating > 0 ? RATING_LABELS[displayRating] : '별점을 선택해주세요'}
        </p>

        <textarea
          className="review-textarea"
          placeholder="한 줄 후기를 남겨보세요 (선택)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={80}
          rows={2}
        />

        <div className="modal__actions">
          <button className="primary-button" disabled={rating === 0} onClick={handleSubmit}>
            평가 저장하기
          </button>
          <button className="ghost-button" onClick={onClose}>
            다음에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewModal;
