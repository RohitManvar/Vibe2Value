/**
 * Normalize projected_score from dataset range [60, 100] to [0, 1].
 *
 * The dataset provides pre-computed projected_score values.
 * We just normalize them into a comparable range for hybrid scoring.
 */
export function normalizeProjectedScore(score: number): number {
  const clamped = Math.max(60, Math.min(100, score));
  return (clamped - 60) / 40;
}
