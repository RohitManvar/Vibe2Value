import express from "express";
import { SERVER_PORT } from "./config/index.js";
import { initProjectionEngine } from "./engine/index.js";
import routes from "./api/routes.js";

async function main() {
  console.log("🚀 Vibe2Value Hybrid Search Engine — Starting...\n");

  await initProjectionEngine();

  const app = express();
  app.use(express.json());
  app.use("/api", routes);

  app.listen(SERVER_PORT, () => {
    console.log(`\n✅ Server running at http://localhost:${SERVER_PORT}`);
    console.log(`   POST /api/search   — Hybrid search endpoint`);
    console.log(`   GET  /api/health   — Health check\n`);
  });
}

main().catch((err) => {
  console.error("💥 Failed to start:", err);
  process.exit(1);
});
