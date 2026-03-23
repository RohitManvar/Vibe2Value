import { initProjectionEngine, search, searchRRF } from "../engine/index.js";
import { closePool } from "../db/connection.js";

/**
 * CLI search tool for testing the projection engine.
 *
 * Usage:
 *   npm run search -- "tech lifestyle creator"
 *   npm run search -- "food blogger high engagement" --category food
 *   npm run search -- "gaming streamer" --rrf
 */

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log("Usage: npm run search -- <query> [--category <cat>] [--rrf] [--limit <n>]");
    process.exit(0);
  }

  // Parse args
  let queryText = "";
  let category: string | undefined;
  let useRRF = false;
  let limit = 10;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--category" && args[i + 1]) {
      category = args[++i]!;
    } else if (args[i] === "--rrf") {
      useRRF = true;
    } else if (args[i] === "--limit" && args[i + 1]) {
      limit = parseInt(args[++i]!, 10);
    } else {
      queryText += (queryText ? " " : "") + (args[i] ?? "");
    }
  }

  console.log(`\n🔍 Query: "${queryText}"`);
  if (category) console.log(`   Category: ${category}`);
  console.log(`   Method: ${useRRF ? "RRF Fusion" : "Weighted Linear"}`);
  console.log(`   Limit: ${limit}\n`);

  await initProjectionEngine();

  const searchFn = useRRF ? searchRRF : search;
  const response = await searchFn({
    query: queryText,
    limit,
    ...(category !== undefined && { categories: [category] }),
  });

  console.log(`⚡ ${response.total} results in ${response.latency_ms}ms\n`);

  console.log("─".repeat(90));
  console.log(
    `${"Rank".padStart(4)} | ${"Username".padEnd(24)} | ${"Semantic".padEnd(10)} | ${"Projected".padEnd(10)} | ${"Final".padEnd(8)}`
  );
  console.log("─".repeat(90));

  for (const r of response.results) {
    console.log(
      `${String(r.rank).padStart(4)} | ${r.username.padEnd(24)} | ${r.scores.semantic_score.toFixed(4).padEnd(10)} | ${r.scores.projected_score.toFixed(4).padEnd(10)} | ${r.scores.final_score.toFixed(4).padEnd(8)}`
    );
  }

  console.log("─".repeat(90));
  await closePool();
}

main().catch((err) => {
  console.error("💥 Search failed:", err);
  process.exit(1);
});
