# Design Notes — Vibe2Value

## How I thought about the weights

When I first looked at this problem I actually tried 50/50 and the results felt off. High-GMV creators were getting buried by creators who had great content but zero sales history. That's not useful for a brand — a beautiful feed means nothing if it doesn't convert.

So I shifted to **60% projected score, 40% semantic**. The thinking was simple: brands care about ROI first. If a creator has a strong proven score, they've already demonstrated they can move product. The semantic side still matters — I don't want a top fitness creator showing up for a home decor query — but relevance should qualify, not dominate.

I debated going even higher on the commerce side (like 70/30) but that started surfacing creators who were kind of a stretch for the query. 60/40 hit the sweet spot in my testing — results were both relevant and commercially strong.

```
final_score = 0.40 × semantic_score + 0.60 × projected_score_normalized
```

The projected score normalization maps the 60-100 range to 0-1:
```
normalized = (projected_score - 60) / 40
```

---

## The zero-GMV constraint

This one was non-negotiable for me. A creator with zero GMV in 30 days, regardless of how well their content matches the query, should not rank above someone who has actually driven sales. Brands spending real budget can't afford to bet on unknowns.

I applied a 0.25x multiplier to zero-GMV creators — aggressive enough that they effectively fall to the bottom of any results list. There's also a softer 0.6x penalty for creators under $1,000 GMV, for those who are just getting started but have *some* history.

In all 5 test queries this held — no zero-GMV creator appeared above a high-GMV creator.

---

## Brand affinity

I kept this as a small bonus, max 0.05 on the final score. I didn't want to hard-filter by demographic match because that's too blunt — a creator might have a slightly different audience breakdown but still be perfect for the brand. The bonus just gives a nudge to creators who tick the industry + gender + age boxes, as a tiebreaker more than anything.

```
brand_affinity = (industry_match × 0.5 + gender_match × 0.3 + age_match × 0.2) × 0.05
```

Industry match gets the most weight because that's the strongest signal — a home brand wants a home creator. Gender and age are secondary.

---

## Why HNSW for the vector index

I went with HNSW over IVFFlat mainly because IVFFlat needs a training step (clustering) before it can serve queries. HNSW just builds as you insert, which made the setup simpler. With 685 creators the dataset is manageable, and HNSW with `m=16, ef_construction=128` gives great recall with very fast query times (sub-10ms ANN search).

---

## Embedding model

I used `all-MiniLM-L6-v2` from @xenova/transformers — it runs locally via ONNX so there's no API dependency or cost, and results are fully reproducible. 384 dimensions is compact enough that the cosine distance ops are fast.

For each creator I embed their bio plus their content tags together:
```
bio + "\nCategories: " + content_style_tags.join(", ")
```

This gives the model both the creator's story and their content focus in one vector.

---

## Dataset expansion

The original RoCathon dataset had 186 creators with rich GMV and demographic data. I merged a second dataset (`dataset.json`, 500 creators) to get to **685 total creators** — giving the search engine a much broader and more realistic pool to rank from.

The second dataset brought new fields: **platform**, **region**, and **category**, which are surfaced as filters in the UI. The merge logic falls back gracefully — creators without GMV data use projected scores derived from engagement metrics.

This expansion also required updating the DB schema to include the new columns, and the seed script now embeds all 685 records in batches of 50.

---

## Search methods: Weighted vs RRF

The engine supports two ranking strategies, selectable per query:

**Weighted (default)**
```
final_score = 0.40 × semantic + 0.60 × projected + brand_affinity
```
Predictable, tunable, works well when you know the right weight balance.

**RRF (Reciprocal Rank Fusion)**
```
rrf_score = Σ 1 / (k + rank_i)   where k = 60
```
Merges rankings from the semantic pass and commercial pass independently, then fuses them. More robust when the two signals are on very different scales or when you want neither to dominate.

In practice, weighted gives slightly more commercially-biased results and RRF gives slightly more balanced ones. Both pass the hard constraint.

---

## Filters (platform / region / category)

Filters are applied as SQL `WHERE` clauses before the HNSW vector search, not after. This keeps the ANN search fast — the index only scans the filtered subset.

```sql
WHERE ($1::text[] IS NULL OR platform = ANY($1))
  AND ($2::text[] IS NULL OR region   = ANY($2))
  AND ($3::text[] IS NULL OR category = ANY($3))
```

Passing `NULL` skips a filter entirely, so unfiltered queries don't pay any cost.

---

## UI design decisions

The frontend is a Next.js 15 app with a premium dark theme (near-black background, green accent `#059669`). Design choices:

- **Glass-morphism cards** — `backdrop-filter: blur(16px)` with low-opacity white borders. Keeps the interface clean without looking flat.
- **Green accent over purple** — green signals "go / performance / money" which aligns with the commercial nature of creator-brand matching.
- **Score bars** — animated width bars for semantic, projected, and final scores give instant visual intuition without requiring users to parse decimal numbers.
- **Example query chips** — users land on the page with no idea what to search. Clickable example queries remove the blank-page problem immediately.
- **Stats bar** — shows total creators, platforms, and categories at a glance so users understand the scope of the search pool.
- **Filter chips** — platform, region, and category filters are inline chips (not a modal) so they're always visible and quick to toggle.

The UI proxies all search requests through Next.js API routes to the Express backend, so the backend URL never leaks to the browser.

---

## Results

Query: *"Affordable home decor for small apartments"* + brand_smart_home

All 10 results came back as Home/Design creators with GMV between $37K–$56K and strong demographic alignment with the brand's target (Female, 25-44). The scoring felt right — semantic relevance got rewarded without sacrificing commercial viability.

Latency averaged around **164ms** per query including embedding + ANN search + re-ranking.

---

## Deployment architecture

```
User → Vercel (Next.js UI)
         ↓  /api/search proxy
      Railway (Express API :3000)
         ↓  pgvector queries
      Supabase (PostgreSQL + pgvector)
```

The Next.js API routes act as a thin proxy — they forward requests to Express and stream back the response. This means:
- The Express backend URL is never exposed to the browser
- CORS is handled at the Next.js layer
- Both services can be scaled independently
