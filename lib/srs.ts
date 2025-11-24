// Spaced Repetition System (SRS) - Leitner Box System
// Box levels and their review intervals:
// Box 1: Review daily (1 day)
// Box 2: Review every 2 days
// Box 3: Review every 4 days
// Box 4: Review weekly (7 days)
// Box 5: Review every 2 weeks (14 days)

const BOX_INTERVALS = {
  1: 1,  // 1 day
  2: 2,  // 2 days
  3: 4,  // 4 days
  4: 7,  // 7 days (weekly)
  5: 14, // 14 days (bi-weekly)
};

export interface ReviewResult {
  newBoxLevel: number;
  nextReviewDate: Date;
  isCorrect: boolean;
}

/**
 * Calculate the next review based on user's response
 * @param currentBoxLevel Current box level (1-5)
 * @param qualityScore User's quality rating (0-5)
 *   5 - Perfect response
 *   4 - Correct after hesitation
 *   3 - Correct with difficulty
 *   2 - Incorrect but remembered
 *   1 - Incorrect, hard to remember
 *   0 - Complete blank
 * @returns ReviewResult with new box level and next review date
 */
export function calculateNextReview(
  currentBoxLevel: number,
  qualityScore: number
): ReviewResult {
  let newBoxLevel = currentBoxLevel;
  let isCorrect = false;

  // Determine if the answer was "correct" (quality 4-5)
  if (qualityScore >= 4) {
    isCorrect = true;
    // Move up one box level (max 5)
    newBoxLevel = Math.min(currentBoxLevel + 1, 5);
  } else if (qualityScore >= 2) {
    isCorrect = false;
    // Stay in current box
    newBoxLevel = currentBoxLevel;
  } else {
    isCorrect = false;
    // Move back to box 1
    newBoxLevel = 1;
  }

  // Calculate next review date
  const daysUntilReview = BOX_INTERVALS[newBoxLevel as keyof typeof BOX_INTERVALS];
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + daysUntilReview);
  nextReviewDate.setHours(0, 0, 0, 0); // Reset to start of day

  return {
    newBoxLevel,
    nextReviewDate,
    isCorrect,
  };
}

/**
 * Simple quality score determination based on user feedback
 * "I knew it" = 5 (perfect)
 * "I didn't know it" = 0 (complete blank)
 */
export function getQualityScore(knew: boolean): number {
  return knew ? 5 : 0;
}
