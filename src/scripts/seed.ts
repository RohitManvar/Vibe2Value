import fs from "fs";
import path from "path";
import { query, withTransaction, closePool } from "../db/connection.js";
import { migrate } from "../db/migrate.js";
import { embedBatch } from "../embedding/index.js";
import type { CreatorRecord } from "../types/index.js";

/**
 * ════════════════════════════════════════════════
 *  SEED SCRIPT — loads creators.json + dataset.json
 * ════════════════════════════════════════════════
 */

const CREATORS_PATH = path.resolve(process.cwd(), "data", "creators.json");
const DATASET_PATH  = path.resolve(process.cwd(), "data", "dataset.json");
const BATCH_SIZE    = 50;

// GPM estimates by category (revenue per 1000 views)
const CATEGORY_GPM: Record<string, number> = {
  beauty:    0.015,
  fashion:   0.013,
  food:      0.012,
  fitness:   0.011,
  lifestyle: 0.010,
  travel:    0.009,
  sports:    0.008,
  tech:      0.008,
  gaming:    0.006,
  education: 0.005,
  music:     0.005,
};

// Category → likely gender skew
const FEMALE_CATS = new Set(["beauty", "fashion", "lifestyle", "food"]);
const MALE_CATS   = new Set(["sports", "gaming", "tech"]);
const YOUTH_CATS  = new Set(["gaming", "music", "education"]);
const MATURE_CATS = new Set(["travel", "lifestyle", "food"]);

interface DatasetRecord {
  username: string;
  content: string;
  category: string;
  tags: string[];
  followers: number;
  views: number;
  engagement_rate: number;
  platform: string;
  region: string;
}

function transformDatasetRecord(r: DatasetRecord): CreatorRecord & {
  platform: string; region: string; category: string;
} {
  const gpm = CATEGORY_GPM[r.category] ?? 0.008;
  const total_gmv_30d = Math.round(r.views * r.engagement_rate * gpm * 10) / 10;

  // Normalize engagement + views → 60-96 projected score
  const engScore  = Math.min(r.engagement_rate / 0.15, 1.0);
  const viewScore = Math.min(Math.log10(Math.max(r.views, 1)) / Math.log10(2_000_000), 1.0);
  const projected_score = Math.round(60 + (engScore * 0.6 + viewScore * 0.4) * 36);

  const major_gender = FEMALE_CATS.has(r.category) ? "FEMALE"
    : MALE_CATS.has(r.category) ? "MALE" : "MIXED";
  const gender_pct = major_gender === "MIXED" ? 50 : 65;

  const age_ranges = MATURE_CATS.has(r.category) ? ["25-34", "35-44"]
    : YOUTH_CATS.has(r.category) ? ["18-24", "13-17"]
    : ["18-24", "25-34"];

  return {
    username: r.username,
    bio: r.content,
    content_style_tags: [r.category, ...r.tags],
    projected_score,
    metrics: {
      follower_count: r.followers,
      total_gmv_30d,
      avg_views_30d: r.views,
      engagement_rate: r.engagement_rate,
      gpm,
      demographics: { major_gender, gender_pct, age_ranges },
    },
    platform: r.platform,
    region: r.region,
    category: r.category,
  };
}

async function insertBatch(
  creators: (CreatorRecord & { platform?: string; region?: string; category?: string })[],
  label: string
) {
  let processed = 0;
  const total = creators.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = creators.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => `${c.bio}\nCategories: ${c.content_style_tags.join(", ")}`);

    console.log(
      `🔮 [${label}] Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)} (${batch.length} records)...`
    );
    const embeddings = await embedBatch(texts);

    await withTransaction(async (client) => {
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const emb = embeddings[j];
        if (!c || !emb) continue;

        await client.query(
          `INSERT INTO creators
            (username, bio, content_style_tags, projected_score,
             follower_count, total_gmv_30d, avg_views_30d, engagement_rate,
             gpm, major_gender, gender_pct, age_ranges,
             platform, region, category, embedding)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::vector)
           ON CONFLICT (username) DO UPDATE SET
             embedding       = EXCLUDED.embedding,
             projected_score = EXCLUDED.projected_score,
             total_gmv_30d   = EXCLUDED.total_gmv_30d,
             platform        = EXCLUDED.platform,
             region          = EXCLUDED.region,
             category        = EXCLUDED.category;`,
          [
            c.username,
            c.bio,
            c.content_style_tags,
            c.projected_score,
            c.metrics.follower_count,
            c.metrics.total_gmv_30d,
            c.metrics.avg_views_30d,
            c.metrics.engagement_rate,
            c.metrics.gpm,
            c.metrics.demographics.major_gender,
            c.metrics.demographics.gender_pct,
            c.metrics.demographics.age_ranges,
            c.platform ?? "",
            c.region ?? "",
            c.category ?? "",
            `[${emb.join(",")}]`,
          ]
        );
      }
    });

    processed += batch.length;
    console.log(`   ✅ Inserted ${processed}/${total}\n`);
  }
}

async function main() {
  console.log("🚀 Starting seed process...\n");
  await migrate();

  // Load creators.json (RoCathon GMV data)
  const creators: (CreatorRecord & { platform?: string; region?: string; category?: string })[] = [];

  if (fs.existsSync(CREATORS_PATH)) {
    const raw = JSON.parse(fs.readFileSync(CREATORS_PATH, "utf-8"));
    const records: CreatorRecord[] = Array.isArray(raw) ? raw : raw.data;
    console.log(`📂 Loaded ${records.length} records from creators.json`);
    creators.push(...records);
  } else {
    console.warn("⚠️  creators.json not found — skipping");
  }

  // Load dataset.json (platform/region enriched data)
  if (fs.existsSync(DATASET_PATH)) {
    const raw: DatasetRecord[] = JSON.parse(fs.readFileSync(DATASET_PATH, "utf-8"));
    const transformed = raw.map(transformDatasetRecord);
    console.log(`📂 Loaded ${transformed.length} records from dataset.json`);
    creators.push(...transformed);
  } else {
    console.warn("⚠️  dataset.json not found — skipping");
  }

  console.log(`\n📊 Total: ${creators.length} creators to seed\n`);

  await query("TRUNCATE TABLE creators;");
  console.log("🗑️  Cleared existing data.\n");

  await insertBatch(creators, "all");

  const countResult = await query("SELECT COUNT(*) FROM creators;");
  console.log(`\n🎉 Seeding complete! ${countResult.rows[0].count} creators in database.`);

  const sample = await query(
    "SELECT username, projected_score, total_gmv_30d, platform, region FROM creators ORDER BY projected_score DESC LIMIT 5;"
  );
  console.log("\n🏆 Top 5 by projected score:");
  sample.rows.forEach((r: Record<string, unknown>, i: number) => {
    console.log(`   ${i + 1}. ${r.username} [${r.platform || "?"}/${r.region || "?"}] — score: ${Number(r.projected_score).toFixed(1)}, gmv: $${Number(r.total_gmv_30d).toLocaleString()}`);
  });

  await closePool();
}

main().catch((err) => {
  console.error("💥 Seed failed:", err);
  process.exit(1);
});
