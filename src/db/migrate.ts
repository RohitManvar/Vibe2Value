import { query } from "./connection.js";
import { EMBEDDING_CONFIG } from "../config/index.js";

export async function migrate() {
  const dim = EMBEDDING_CONFIG.dimensions;
  console.log(`🔧 Running migration (embedding dimensions: ${dim})...`);

  await query(`CREATE EXTENSION IF NOT EXISTS vector;`);

  await query(`DROP TABLE IF EXISTS creators;`);

  await query(`
    CREATE TABLE creators (
      username          TEXT PRIMARY KEY,
      bio               TEXT NOT NULL,
      content_style_tags TEXT[] DEFAULT '{}',
      projected_score   DOUBLE PRECISION NOT NULL DEFAULT 60,
      follower_count    BIGINT NOT NULL DEFAULT 0,
      total_gmv_30d     DOUBLE PRECISION NOT NULL DEFAULT 0,
      avg_views_30d     DOUBLE PRECISION NOT NULL DEFAULT 0,
      engagement_rate   DOUBLE PRECISION NOT NULL DEFAULT 0,
      gpm               DOUBLE PRECISION NOT NULL DEFAULT 0,
      major_gender      TEXT DEFAULT '',
      gender_pct        INTEGER DEFAULT 0,
      age_ranges        TEXT[] DEFAULT '{}',
      embedding         vector(${dim})
    );
  `);

  // HNSW index for fast ANN search (cosine distance)
  await query(`
    CREATE INDEX idx_creators_embedding_hnsw
    ON creators
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 128);
  `);

  await query(`CREATE INDEX idx_creators_tags ON creators USING GIN (content_style_tags);`);
  await query(`CREATE INDEX idx_creators_projected ON creators (projected_score DESC);`);
  await query(`CREATE INDEX idx_creators_gmv ON creators (total_gmv_30d DESC);`);

  console.log("Migration complete!");
}
