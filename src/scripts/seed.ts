import fs from "fs";
import path from "path";
import { query, withTransaction, closePool } from "../db/connection.js";
import { migrate } from "../db/migrate.js";
import { embedBatch } from "../embedding/index.js";
import type { CreatorRecord } from "../types/index.js";

/**
 * ════════════════════════════════════════════════
 *  SEED SCRIPT
 * ════════════════════════════════════════════════
 *  Usage: npm run seed
 *  Expects: ./data/creators.json
 */

const DATA_PATH = path.resolve(process.cwd(), "data", "creators.json");
const BATCH_SIZE = 50;

async function main() {
  console.log("🚀 Starting seed process...\n");

  await migrate();

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`❌ Dataset not found at ${DATA_PATH}`);
    process.exit(1);
  }

  console.log(`📂 Loading dataset from ${DATA_PATH}...`);
  const rawData = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
  const creators: CreatorRecord[] = Array.isArray(rawData) ? rawData : rawData.data;
  console.log(`   Found ${creators.length} creator records.\n`);

  await query("TRUNCATE TABLE creators;");
  console.log("🗑️  Cleared existing data.\n");

  let processed = 0;

  for (let i = 0; i < creators.length; i += BATCH_SIZE) {
    const batch = creators.slice(i, i + BATCH_SIZE);

    // Build embedding text: bio + content_style_tags
    const texts = batch.map((c) => {
      return `${c.bio}\nCategories: ${c.content_style_tags.join(", ")}`;
    });

    console.log(
      `🔮 Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(creators.length / BATCH_SIZE)} (${batch.length} records)...`
    );
    const embeddings = await embedBatch(texts);

    await withTransaction(async (client) => {
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const emb = embeddings[j];
        if (!c || !emb) continue;

        const embStr = `[${emb.join(",")}]`;

        await client.query(
          `INSERT INTO creators
            (username, bio, content_style_tags, projected_score,
             follower_count, total_gmv_30d, avg_views_30d, engagement_rate,
             gpm, major_gender, gender_pct, age_ranges, embedding)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::vector)
           ON CONFLICT (username) DO UPDATE SET
             embedding = EXCLUDED.embedding,
             projected_score = EXCLUDED.projected_score,
             total_gmv_30d = EXCLUDED.total_gmv_30d;`,
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
            embStr,
          ]
        );
      }
    });

    processed += batch.length;
    console.log(`   ✅ Inserted ${processed}/${creators.length}\n`);
  }

  const countResult = await query("SELECT COUNT(*) FROM creators;");
  console.log(`\n🎉 Seeding complete! ${countResult.rows[0].count} creators in database.`);

  const sample = await query(
    "SELECT username, projected_score, total_gmv_30d FROM creators ORDER BY projected_score DESC LIMIT 5;"
  );
  console.log("\n🏆 Top 5 by projected score:");
  sample.rows.forEach((r: Record<string, unknown>, i: number) => {
    console.log(`   ${i + 1}. ${r.username} — score: ${Number(r.projected_score).toFixed(1)}, gmv: $${Number(r.total_gmv_30d).toLocaleString()}`);
  });

  await closePool();
}

main().catch((err) => {
  console.error("💥 Seed failed:", err);
  process.exit(1);
});
