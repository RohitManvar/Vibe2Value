/**
 * Recency scoring using exponential time decay.
 *
 * Newer content gets a higher score. The decay rate determines
 * how quickly old content loses relevance.
 *
 * Formula: recency = exp(-lambda * age_days)
 *
 * With halfLife = 30 days:
 *   - 0 days old  → score = 1.00
 *   - 7 days old  → score = 0.85
 *   - 30 days old → score = 0.50
 *   - 90 days old → score = 0.125
 */

const DEFAULT_HALF_LIFE_DAYS = 30;

/**
 * Compute recency score (0 to 1) for a given creation timestamp.
 */
export function computeRecencyScore(
  createdAt: string | Date,
  halfLifeDays: number = DEFAULT_HALF_LIFE_DAYS
): number {
  const created = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const now = new Date();
  const ageDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

  if (ageDays <= 0) return 1.0;

  const lambda = Math.LN2 / halfLifeDays;
  return Math.exp(-lambda * ageDays);
}
