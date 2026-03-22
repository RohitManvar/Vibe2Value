import { Router } from "express";
import type { Request, Response } from "express";
import { search, searchRRF } from "../engine/index.js";
import { BRAND_PROFILES } from "../config/index.js";
import type { SearchQuery } from "../types/index.js";

const router = Router();

/**
 * POST /api/search
 *
 * Body:
 * {
 *   "query": "Affordable home decor for small apartments",
 *   "brand": "brand_smart_home",  // optional brand profile id
 *   "industries": ["Home"],       // optional filter
 *   "limit": 10,
 *   "method": "weighted" | "rrf"
 * }
 */
router.post("/search", async (req: Request, res: Response) => {
  try {
    const { query: queryText, brand: brandId, industries, limit, method } = req.body as {
      query?: string;
      brand?: string;
      industries?: string[];
      limit?: number;
      method?: string;
    };

    if (!queryText || typeof queryText !== "string") {
      res.status(400).json({ error: "Missing required field: query" });
      return;
    }

    const brandProfile = brandId ? BRAND_PROFILES[brandId] : undefined;

    const input: SearchQuery = {
      query: queryText,
      brand: brandProfile,
      industries: brandProfile?.industries ?? industries,
      limit: limit ?? 20,
    };

    const searchFn = method === "rrf" ? searchRRF : search;
    const response = await searchFn(input);

    res.json(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Search error:", message);
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/health
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
