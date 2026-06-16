export const getPerformerScore = (performers) => {
  const rawScore = (Math.log10(performers + 1) / Math.log10(100)) * 100;
  return Math.min(100, Number(rawScore.toFixed(2)));
};

export const calculateTripickScore = ({
  completionRate,
  averageRating,
  performers,
}) => {
  const performerScore = getPerformerScore(performers);
  const ratingScore = (averageRating / 5) * 100;
  const score =
    0.5 * completionRate + 0.3 * ratingScore + 0.2 * performerScore;

  return {
    performerScore,
    ratingScore: Number(ratingScore.toFixed(2)),
    totalScore: Number(score.toFixed(2)),
  };
};
