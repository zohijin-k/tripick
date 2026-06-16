function ScoreBar({ label, value, tone = 'green' }) {
  return (
    <div className="score-bar">
      <div className="score-bar__label">
        <span>{label}</span>
        <strong>{value.toFixed ? value.toFixed(1) : value}</strong>
      </div>
      <div className="score-bar__track">
        <div
          className={`score-bar__fill score-bar__fill--${tone}`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}

export default ScoreBar;
