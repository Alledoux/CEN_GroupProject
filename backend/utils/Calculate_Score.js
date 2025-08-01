function calculateScore(task) {
  const now = new Date();
  const deadline = new Date(task.deadline);
  const timeRemainingMs = deadline - now;

  let score = 0;

  if (task.completion === 100) {
    return 0; // Completed tasks have no score
  }

  // Overdue tasks should have the highest priority score
  if (timeRemainingMs <= 0) {
    score += 20;
  } else if (timeRemainingMs <= 1000 * 60 * 60 * 24) {
    score += 10;
  } else if (timeRemainingMs <= 1000 * 60 * 60 * 24 * 3) {
    score += 7;
  } else if (timeRemainingMs <= 1000 * 60 * 60 * 24 * 7) {
    score += 4;
  } else {
    score += 1;
  }

  if (task.importance >= 4) {
    score += 8;
  } else if (task.importance >= 2) {
    score += 5;
  } else {
    score += 2;
  }


  if (task.difficulty <= 1) {
    score += 5;
  } else if (task.difficulty <= 3) {
    score += 3;
  } else {
    score += 1;
  }

  return score;
}

module.exports = calculateScore;
