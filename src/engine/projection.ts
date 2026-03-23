import { query } from "../db/connection.js";
import { embed } from "../embedding/index.js";
import { normalizeProjectedScore } from "./performance.js";
import { DEFAULT_WEIGHTS, ZERO_GMV_PENALTY } from "../config/index.js";
import type {
  CreatorRecord,
  RankedCreator,
  SearchQuery,
  SearchResponse,
  BrandProfile,
} from "../types/index.js";

/**
 * ════════════════════════════════════════════════════════════════
 *  PROJECTION ENGINE — RoCathon Hybrid Search
 * ════════════════════════════════════════════════════════════════
 *
 *  Pipeline:
 *    1. Embed the query text → vector
 *    2. pgvector HNSW ANN search → top-K candidates by cosine similarity
 *    3. For each candidate:
 *       a. semantic_score  = cosine similarity (from pgvector)
 *       b. projected_score = normalized pre-computed score (60-100 → 0-1)
 *    4. final_score = 0.40 * semantic + 0.60 * projected
 *    5. HARD CONSTRAINT: zero-GMV creators get 0.25x penalty
 *    6. Re-rank by final_score DESC
 */

const CANDIDATE_MULTIPLIER = 5;

/**
 * Verify DB connection and count creators at startup.
 */
export async function initProjectionEngine(): Promise<void> {
  const result = await query(`SELECT COUNT(*) as total FROM creators;`);
  const total = Number(result.rows[0]?.total ?? 0);
  console.log(`📊 Projection engine initialized — ${total} creators in DB.`);
}

/**
 * Compute brand affinity score (0-1) based on industry + demographic match.
 * Used as a small tie-breaker bonus.
 */
function brandAffinity(creator: CreatorRecord, brand?: BrandProfile): number {
  if (!brand) return 0;

  let score = 0;

  // Industry match
  const industryMatch = creator.content_style_tags.some(tag =>
    brand.industries.some(ind => tag.toLowerCase().includes(ind.toLowerCase()))
  );
  if (industryMatch) score += 0.5;

  // Demographic match (gender)
  const genderMatch =
    brand.target_audience.gender.toUpperCase() === creator.metrics.demographics.major_gender.toUpperCase();
  if (genderMatch) score += 0.3;

  // Age range overlap
  const ageMatch = creator.metrics.demographics.age_ranges.some(age =>
    brand.target_audience.age_ranges.includes(age)
  );
  if (ageMatch) score += 0.2;

  return score;
}

/**
 * Main search function — weighted hybrid pipeline
 */
export async function search(input: SearchQuery): Promise<SearchResponse> {
  const startTime = Date.now();
  const limit = input.limit ?? 20;
  const candidateCount = limit * CANDIDATE_MULTIPLIER;

  // Step 1: Embed the query
  const queryEmbedding = await embed(input.query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Step 2: ANN search via pgvector HNSW — build dynamic WHERE clause
  const conditions: string[] = [];
  const params: unknown[] = [embeddingStr];

  if (input.industries && input.industries.length > 0) {
    params.push(input.industries);
    conditions.push(`content_style_tags && $${params.length}::text[]`);
  }
  if (input.platforms && input.platforms.length > 0) {
    params.push(input.platforms);
    conditions.push(`platform = ANY($${params.length}::text[])`);
  }
  if (input.regions && input.regions.length > 0) {
    params.push(input.regions);
    conditions.push(`region = ANY($${params.length}::text[])`);
  }
  if (input.categories && input.categories.length > 0) {
    params.push(input.categories);
    conditions.push(`category = ANY($${params.length}::text[])`);
  }

  params.push(candidateCount);
  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT *,
      1 - (embedding <=> $1::vector) AS cosine_similarity
    FROM creators
    ${where}
    ORDER BY embedding <=> $1::vector
    LIMIT $${params.length};
  `;

  const result = await query(sql, params as unknown[]);

  // Step 3 & 4: Score and re-rank
  const scored: RankedCreator[] = result.rows.map((row: Record<string, unknown>) => {
    const creator: CreatorRecord = {
      username: row.username as string,
      bio: row.bio as string,
      content_style_tags: (row.content_style_tags as string[]) || [],
      projected_score: Number(row.projected_score),
      metrics: {
        follower_count: Number(row.follower_count),
        total_gmv_30d: Number(row.total_gmv_30d),
        avg_views_30d: Number(row.avg_views_30d),
        engagement_rate: Number(row.engagement_rate),
        gpm: Number(row.gpm),
        demographics: {
          major_gender: (row.major_gender as string) || '',
          gender_pct: Number(row.gender_pct),
          age_ranges: (row.age_ranges as string[]) || [],
        },
      },
    };

    const semantic_score = Math.max(0, Number(row.cosine_similarity));
    const projected_score_normalized = normalizeProjectedScore(creator.projected_score);

    // Brand affinity bonus (small)
    const affinity = brandAffinity(creator, input.brand) * 0.05;

    // Hybrid score
    let final_score =
      DEFAULT_WEIGHTS.semantic_weight * semantic_score +
      DEFAULT_WEIGHTS.projected_weight * projected_score_normalized +
      affinity;

    // HARD CONSTRAINT: zero-GMV penalty
    if (creator.metrics.total_gmv_30d === 0) {
      final_score *= ZERO_GMV_PENALTY;
    } else if (creator.metrics.total_gmv_30d < 1000) {
      final_score *= 0.6;
    }

    return {
      ...creator,
      platform: (row.platform as string) || "",
      region: (row.region as string) || "",
      category: (row.category as string) || "",
      scores: {
        semantic_score: parseFloat(semantic_score.toFixed(4)),
        projected_score: parseFloat(projected_score_normalized.toFixed(4)),
        final_score: parseFloat(final_score.toFixed(4)),
      },
      rank: 0,
    };
  });

  // Step 5: Sort and assign ranks
  scored.sort((a, b) => b.scores.final_score - a.scores.final_score);

  const results = scored.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return {
    results,
    query: input.query,
    total: results.length,
    latency_ms: Date.now() - startTime,
  };
}

/**
 * RRF variant — fuses vector rank + projected_score rank
 */
export async function searchRRF(input: SearchQuery): Promise<SearchResponse> {
  const startTime = Date.now();
  const limit = input.limit ?? 20;
  const candidateCount = limit * CANDIDATE_MULTIPLIER;
  const k = 60;

  const queryEmbedding = await embed(input.query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const vectorResults = await query(
    `SELECT *,
       1 - (embedding <=> $1::vector) AS cosine_similarity
     FROM creators
     ORDER BY embedding <=> $1::vector
     LIMIT $2;`,
    [embeddingStr, candidateCount]
  );

  const perfResults = await query(
    `SELECT username, projected_score FROM creators ORDER BY projected_score DESC LIMIT $1;`,
    [candidateCount]
  );

  const vectorRanks = new Map<string, number>();
  vectorResults.rows.forEach((row: Record<string, unknown>, idx: number) => {
    vectorRanks.set(row.username as string, idx + 1);
  });

  const perfRanks = new Map<string, number>();
  perfResults.rows.forEach((row: Record<string, unknown>, idx: number) => {
    perfRanks.set(row.username as string, idx + 1);
  });

  const scored: RankedCreator[] = vectorResults.rows.map((row: Record<string, unknown>) => {
    const creator: CreatorRecord = {
      username: row.username as string,
      bio: row.bio as string,
      content_style_tags: (row.content_style_tags as string[]) || [],
      projected_score: Number(row.projected_score),
      metrics: {
        follower_count: Number(row.follower_count),
        total_gmv_30d: Number(row.total_gmv_30d),
        avg_views_30d: Number(row.avg_views_30d),
        engagement_rate: Number(row.engagement_rate),
        gpm: Number(row.gpm),
        demographics: {
          major_gender: (row.major_gender as string) || '',
          gender_pct: Number(row.gender_pct),
          age_ranges: (row.age_ranges as string[]) || [],
        },
      },
    };

    const vecRank = vectorRanks.get(creator.username) ?? candidateCount;
    const pRank = perfRanks.get(creator.username) ?? candidateCount;
    const semantic_score = Math.max(0, Number(row.cosine_similarity));

    let rrf_score = 1 / (k + vecRank) + 1 / (k + pRank);

    // Zero-GMV penalty
    if (creator.metrics.total_gmv_30d === 0) {
      rrf_score *= ZERO_GMV_PENALTY;
    } else if (creator.metrics.total_gmv_30d < 1000) {
      rrf_score *= 0.6;
    }

    const projected_norm = normalizeProjectedScore(creator.projected_score);

    return {
      ...creator,
      platform: (row.platform as string) || "",
      region: (row.region as string) || "",
      category: (row.category as string) || "",
      scores: {
        semantic_score: parseFloat(semantic_score.toFixed(4)),
        projected_score: parseFloat(projected_norm.toFixed(4)),
        final_score: parseFloat(rrf_score.toFixed(6)),
      },
      rank: 0,
    };
  });

  scored.sort((a, b) => b.scores.final_score - a.scores.final_score);

  const results = scored.slice(0, limit).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  return {
    results,
    query: input.query,
    total: results.length,
    latency_ms: Date.now() - startTime,
  };
}
