import { writeFileSync } from "fs";
import { initProjectionEngine, search } from "../engine/index.js";
import { closePool } from "../db/connection.js";
import { BRAND_PROFILES } from "../config/index.js";

/**
 * Generates the submission JSON file for RoCathon.
 * Query: "Affordable home decor for small apartments"
 * Brand: brand_smart_home
 * Output: ./submission.json (top 10 ranked creators)
 *
 * Usage: npm run generate-submission
 */
async function main() {
  console.log("🎯 Generating RoCathon submission...\n");

  await initProjectionEngine();

  const brand = BRAND_PROFILES["brand_smart_home"]!;
  const response = await search({
    query: "Affordable home decor for small apartments",
    brand,
    industries: brand.industries,
    limit: 10,
  });

  // Format to submission spec: RankedCreator[] with required score fields
  const submission = response.results.map((r) => ({
    username: r.username,
    bio: r.bio,
    content_style_tags: r.content_style_tags,
    projected_score: r.projected_score,
    metrics: r.metrics,
    scores: {
      semantic_score: r.scores.semantic_score,
      projected_score: r.scores.projected_score,
      final_score: r.scores.final_score,
    },
  }));

  writeFileSync("./submission.json", JSON.stringify(submission, null, 2));

  console.log(`✅ submission.json generated with ${submission.length} results\n`);
  console.log(`Results in ${response.latency_ms}ms:\n`);
  submission.forEach((r, i) => {
    console.log(
      `${i + 1}. ${r.username.padEnd(30)} score=${r.scores.final_score.toFixed(4)} gmv=$${r.metrics.total_gmv_30d.toLocaleString()}`
    );
  });

  await closePool();
}

main().catch((err) => {
  console.error("💥 Failed:", err);
  process.exit(1);
});
