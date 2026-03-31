import express from "express";
import { SERVER_PORT } from "./config/index.js";
import { initProjectionEngine } from "./engine/index.js";
import routes from "./api/routes.js";

async function main() {
  console.log("🚀 Vibe2Value Hybrid Search Engine — Starting...\n");

  await initProjectionEngine();

  const app = express();

  // CORS — allow Vercel frontend to reach this backend
  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
      .split(",")
      .map((o) => o.trim());
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json());
  app.use("/api", routes);

  app.get("/", (_req, res) => {
    res.json({
      name: "Vibe2Value API",
      version: "1.0.0",
      status: "running",
      endpoints: {
        search: "POST /api/search",
        meta:   "GET  /api/meta",
        health: "GET  /api/health",
      },
    });
  });

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
