const difficultyBuckets = [
  {
    maxRating: 350,
    label: "Easy",
    weights: { easy: 1 },
  },
  {
    maxRating: 450,
    label: "Balanced (Easy/Medium)",
    weights: { easy: 0.5, medium: 0.5 },
  },
  {
    maxRating: 550,
    label: "Balanced (Medium/Hard)",
    weights: { medium: 0.5, hard: 0.5 },
  },
  {
    maxRating: Infinity,
    label: "Hard",
    weights: { hard: 1 },
  },
];

const DIFFICULTY_FALLBACK = "medium";

export function getDifficultyBucket(rating = 400) {
  return difficultyBuckets.find((bucket) => rating < bucket.maxRating) ?? difficultyBuckets[difficultyBuckets.length - 1];
}

export function getDifficultyLabel(rating = 400) {
  return getDifficultyBucket(rating).label;
}

export function pickDifficultyForRating(rating = 400) {
  const bucket = getDifficultyBucket(rating);
  const entries = Object.entries(bucket.weights);

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  const roll = Math.random() * totalWeight;
  let cumulative = 0;

  for (const [difficulty, weight] of entries) {
    cumulative += weight;
    if (roll <= cumulative) {
      return difficulty;
    }
  }

  return DIFFICULTY_FALLBACK;
}

export function getMaxRatingDifference(waitedMs = 0) {
  const minutes = Math.floor(waitedMs / 60000);
  const base = 100;
  const increment = 100;
  const maxCap = 400;
  return Math.min(base + minutes * increment, maxCap);
}

