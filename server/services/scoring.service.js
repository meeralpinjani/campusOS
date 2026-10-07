/**
 * Logarithmic decay hot ranking algorithm inspired by Reddit.
 * Gives weight to recent posts while letting highly upvoted posts stay visible.
 * 
 * @param {number} upvotes - Count of upvotes
 * @param {number} downvotes - Count of downvotes
 * @param {Date} createdAt - Post creation date
 * @returns {number} Floating-point hot score
 */
const calculateHotScore = (upvotes = 0, downvotes = 0, createdAt = new Date()) => {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  
  let sign = 0;
  if (score > 0) sign = 1;
  else if (score < 0) sign = -1;

  // Epoch baseline (Jan 1, 2025)
  const epochSeconds = 1735689600;
  const postSeconds = Math.floor(new Date(createdAt).getTime() / 1000);
  const seconds = postSeconds - epochSeconds;

  // 45,000 seconds = 12.5 hours decay factor
  const hotScore = sign * order + seconds / 45000;
  
  return Number(hotScore.toFixed(7));
};

module.exports = {
  calculateHotScore,
};
