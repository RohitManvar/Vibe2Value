import { Router } from "express";
import type { Request, Response } from "express";
import { search, searchRRF } from "../engine/index.js";
import { BRAND_PROFILES } from "../config/index.js";
import { query } from "../db/connection.js";
import type { SearchQuery } from "../types/index.js";

const router = Router();

/**
 * POST /api/search
 */
router.post("/search", async (req: Request, res: Response) => {
  try {
    const {
      query: queryText,
      brand: brandId,
      industries,
      platforms,
      regions,
      categories,
      limit,
      method,
    } = req.body as {
      query?: string;
      brand?: string;
      industries?: string[];
      platforms?: string[];
      regions?: string[];
      categories?: string[];
      limit?: number;
      method?: string;
    };

    if (!queryText || typeof queryText !== "string") {
      res.status(400).json({ error: "Missing required field: query" });
      return;
    }

    const brandProfile = brandId ? BRAND_PROFILES[brandId] : undefined;
    const resolvedIndustries = brandProfile?.industries ?? industries;

    const input: SearchQuery = {
      query: queryText,
      ...(brandProfile !== undefined && { brand: brandProfile }),
      ...(resolvedIndustries !== undefined && { industries: resolvedIndustries }),
      ...(platforms?.length && { platforms }),
      ...(regions?.length && { regions }),
      ...(categories?.length && { categories }),
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
 * GET /api/meta — returns DB stats for the UI
 */
router.get("/meta", async (_req: Request, res: Response) => {
  try {
    const [countRes, platformRes, regionRes, categoryRes] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM creators;`),
      query(`SELECT platform, COUNT(*) as count FROM creators WHERE platform != '' GROUP BY platform ORDER BY count DESC;`),
      query(`SELECT region, COUNT(*) as count FROM creators WHERE region != '' GROUP BY region ORDER BY count DESC;`),
      query(`SELECT category, COUNT(*) as count FROM creators WHERE category != '' GROUP BY category ORDER BY count DESC;`),
    ]);

    res.json({
      total: Number(countRes.rows[0]?.total ?? 0),
      platforms: platformRes.rows.map((r: Record<string, unknown>) => ({
        value: r.platform as string,
        count: Number(r.count),
      })),
      regions: regionRes.rows.map((r: Record<string, unknown>) => ({
        value: r.region as string,
        count: Number(r.count),
      })),
      categories: categoryRes.rows.map((r: Record<string, unknown>) => ({
        value: r.category as string,
        count: Number(r.count),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
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
