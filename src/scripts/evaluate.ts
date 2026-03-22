import { initProjectionEngine, search } from "../engine/index.js";
import { closePool } from "../db/connection.js";
import { BRAND_PROFILES } from "../config/index.js";

/**
 * Evaluation script — tests constraint satisfaction and ranking quality.
 * Usage: npm run evaluate
 */

const TEST_QUERIES = [
  { query: "affordable home decor small apartments", brand: "brand_smart_home" },
  { query: "fitness workout equipment home gym", brand: "brand_active_life" },
  { query: "skincare beauty makeup tutorials", brand: "brand_glow_beauty" },
  { query: "healthy recipes meal prep food", brand: undefined },
  { query: "fashion style outfit ideas", brand: undefined },
];

async function main() {
  console.log("🧪 RoCathon Evaluation Suite\n");
  console.log("═".repeat(70));

  await initProjectionEngine();

  let constraintsPassed = 0;
  let totalLatency = 0;

  for (const testCase of TEST_QUERIES) {
    const brandProfile = testCase.brand ? BRAND_PROFILES[testCase.brand] : undefined;

    const response = await search({
      query: testCase.query,
      ...(brandProfile && { brand: brandProfile, industries: brandProfile.industries }),
      limit: 20,
    });

    // Check hard constraint: no zero-GMV creator should rank above a high-GMV creator
    let constraintOk = true;
    for (let i = 0; i < response.results.length; i++) {
      for (let j = i + 1; j < response.results.length; j++) {
        const higher = response.results[i];
        const lower = response.results[j];
        if (!higher || !lower) continue;
        if (
          higher.metrics.total_gmv_30d === 0 &&
          lower.metrics.total_gmv_30d > 5000
        ) {
          constraintOk = false;
          break;
        }
      }
      if (!constraintOk) break;
    }

    if (constraintOk) constraintsPassed++;
    totalLatency += response.latency_ms;

    const icon = constraintOk ? "✅" : "❌";
    console.log(`\n${icon} Query: "${testCase.query}" (${response.latency_ms}ms)`);
    response.results.slice(0, 3).forEach((r) => {
      console.log(
        `   ${r.username.padEnd(25)} sem=${r.scores.semantic_score.toFixed(3)} proj=${r.scores.projected_score.toFixed(3)} final=${r.scores.final_score.toFixed(3)} gmv=$${r.metrics.total_gmv_30d.toLocaleString()}`
      );
    });
  }

  console.log("\n" + "═".repeat(70));
  console.log("📊 EVALUATION SUMMARY");
  console.log("═".repeat(70));
  console.log(`   Queries tested:       ${TEST_QUERIES.length}`);
  console.log(`   Constraint pass rate: ${constraintsPassed}/${TEST_QUERIES.length} (${((constraintsPassed / TEST_QUERIES.length) * 100).toFixed(1)}%)`);
  console.log(`   Avg latency:          ${(totalLatency / TEST_QUERIES.length).toFixed(0)}ms`);

  if (constraintsPassed === TEST_QUERIES.length) {
    console.log("\n🏆 ALL CONSTRAINTS SATISFIED — ready for submission!");
  } else {
    console.log("\n⚠️  Some constraints failed.");
  }
  console.log("═".repeat(70));

  await closePool();
}

main().catch((err) => {
  console.error("💥 Evaluation failed:", err);
  process.exit(1);
});
