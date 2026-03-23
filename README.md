# Vibe2Value — Hybrid Creator Search Engine

> Ranks creators by **semantic relevance** (what they talk about) + **commercial performance** (projected GMV) — not just keyword matching, not just follower count.

## The Problem

Traditional creator search fails brands in two ways:
1. **Keyword search** finds creators who mention the right words but have no proven sales record
2. **Performance-only ranking** surfaces high-GMV creators who are completely irrelevant to the brand's niche

Vibe2Value solves this with a **hybrid pipeline** that balances both signals.

## How It Works

```
User Query (natural language)
       │
       ▼
  Embed with all-MiniLM-L6-v2 (384d, local ONNX — no API key)
       │
       ▼
  pgvector HNSW ANN Search  ──►  top-K candidates by cosine similarity
       │
       ▼
  Hybrid Scoring (per candidate)
  ┌─────────────────────────────────────────────────────────┐
  │  semantic_score        = cosine similarity (0-1)        │
  │  projected_normalized  = (projected_score - 60) / 40   │
  │  brand_affinity        = industry + gender + age match  │
  │                                                         │
  │  final_score = 0.40 × semantic                         │
  │              + 0.60 × projected_normalized              │
  │              + brand_affinity (max 0.05 bonus)          │
  │                                                         │
  │  HARD CONSTRAINT:                                       │
  │    GMV = 0       → score × 0.25  (near-zero ranking)   │
  │    GMV < $1,000  → score × 0.60  (soft penalty)        │
  └─────────────────────────────────────────────────────────┘
       │
       ▼
  Re-rank → Return top-N with full score breakdown
```

### Why these weights?

- **0.60 projected score** — brand campaigns live or die on sales conversion. A creator with a beautiful aesthetic but zero GMV history is a risk.
- **0.40 semantic** — relevance still matters. A top-GMV fitness creator shouldn't rank for home decor queries.
- **Brand affinity as a bonus** (not a gate) — demographic match nudges relevant creators up without hard-filtering the pool.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Database | PostgreSQL + pgvector | Production-grade vector store, HNSW for sub-10ms ANN at scale |
| Embeddings | @xenova/transformers (all-MiniLM-L6-v2) | Runs locally — no API cost, no rate limits, reproducible |
| Runtime | Node.js + TypeScript (ESM) | Type-safe, modern JS ecosystem |
| API | Express 5 | Lightweight REST layer |
| UI | Next.js 15 + Tailwind CSS | Premium glass-morphism interface with real-time search |

## Dataset

The engine now merges **two datasets** for a total of **685 creators**:

| Source | Creators | Fields |
|--------|----------|--------|
| `creators.json` | 186 | Real RoCathon GMV data, bio, demographics |
| `dataset.json` | 500 | Platform, region, category, engagement stats |

**10 categories**: beauty · fashion · fitness · food · gaming · lifestyle · music · sports · tech · travel

**4 platforms**: Instagram · TikTok · YouTube · Twitter

**10 regions**: US · IN · UK · AU · CA · DE · FR · JP · BR · SG

## Setup

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL with pgvector)

### 1. Install dependencies
```bash
npm install
```

### 2. Start PostgreSQL with pgvector
```bash
docker compose up -d
```

### 3. Migrate schema + seed creators
```bash
npm run migrate   # creates table + HNSW index
npm run seed      # embeds 685 creators (~4 min on first run, model downloads once)
```

### 4. Start API server
```bash
npm run dev       # Express on port 3000
```

### 5. Start UI (optional)
```bash
cd ui
npm install
npm run build
npm start         # Next.js on port 8181
```

Open **http://localhost:8181** in your browser.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run migrate` | Creates `creators` table with HNSW vector index |
| `npm run seed` | Embeds all 685 creators and inserts into DB |
| `npm run evaluate` | Runs 5 test queries, checks constraint satisfaction |
| `npm run generate-submission` | Produces `submission.json` |
| `npm run dev` | Starts Express server on port 3000 (with nodemon) |

## API Reference

### POST /api/search

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Affordable home decor for small apartments",
    "brand": "brand_smart_home",
    "limit": 10,
    "method": "weighted",
    "platforms": ["instagram", "tiktok"],
    "regions": ["US", "UK"],
    "categories": ["lifestyle", "food"]
  }'
```

**Body fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `query` | string | ✅ | Natural language search query |
| `brand` | string | — | Brand profile ID (`brand_smart_home`, `brand_active_life`, `brand_glow_beauty`) |
| `limit` | number | — | Max results (default: 20) |
| `method` | string | — | `weighted` (default) or `rrf` |
| `platforms` | string[] | — | Filter by platform (`instagram`, `tiktok`, `youtube`, `twitter`) |
| `regions` | string[] | — | Filter by region (`US`, `IN`, `UK`, etc.) |
| `categories` | string[] | — | Filter by category (`beauty`, `fitness`, etc.) |

**Response:**
```json
{
  "results": [
    {
      "username": "cozy_small_apartment_coco",
      "platform": "instagram",
      "region": "US",
      "category": "lifestyle",
      "scores": {
        "semantic_score": 0.653,
        "projected_score": 0.800,
        "final_score": 0.788
      },
      "metrics": { "total_gmv_30d": 55000, "engagement_rate": 0.075 },
      "rank": 1
    }
  ],
  "query": "Affordable home decor for small apartments",
  "total": 10,
  "latency_ms": 164
}
```

### GET /api/meta

Returns live DB stats used by the UI (creator count, available platforms, regions, categories).

```bash
curl http://localhost:3000/api/meta
```

```json
{
  "total": 685,
  "platforms": [{"value": "youtube", "count": 138}, ...],
  "regions": [{"value": "US", "count": 95}, ...],
  "categories": [{"value": "fitness", "count": 72}, ...]
}
```

### GET /api/health

Returns server status.

## Evaluation Results

```
✅ "affordable home decor small apartments"    — constraint OK
✅ "fitness workout equipment home gym"        — constraint OK
✅ "skincare beauty makeup tutorials"          — constraint OK
✅ "healthy recipes meal prep food"            — constraint OK
✅ "fashion style outfit ideas"                — constraint OK

Constraint pass rate: 5/5 (100%)
Avg latency: 164ms
```

**Hard constraint verified**: no zero-GMV creator ranked above any creator with GMV > $5,000 across all test queries.

## Submission Output

`submission.json` — top 10 creators for:
- **Query**: "Affordable home decor for small apartments"
- **Brand**: `brand_smart_home` (Home industry · Female · 25-44)

| Rank | Creator | Final Score | GMV (30d) |
|------|---------|-------------|-----------|
| 1 | cozy_small_apartment_coco | 0.7882 | $55,000 |
| 2 | luxury_for_less_lara | 0.7468 | $53,000 |
| 3 | cozy_home_with_lisa | 0.7376 | $42,000 |
| 4 | affordable_apartment_decor_aisha | 0.7336 | $47,000 |
| 5 | decor_on_a_dime_dana | 0.7326 | $39,000 |

All results are Home/Design creators with proven GMV — exactly what `brand_smart_home` needs.

## Database Schema

```sql
CREATE TABLE creators (
  username          TEXT PRIMARY KEY,
  bio               TEXT,
  content_style_tags TEXT[],          -- GIN indexed for fast tag filtering
  projected_score   DOUBLE PRECISION, -- pre-computed 60-100 score
  follower_count    BIGINT,
  total_gmv_30d     DOUBLE PRECISION, -- hard constraint enforcement
  avg_views_30d     DOUBLE PRECISION,
  engagement_rate   DOUBLE PRECISION,
  gpm               DOUBLE PRECISION,
  major_gender      TEXT,
  gender_pct        INTEGER,
  age_ranges        TEXT[],
  platform          TEXT,             -- instagram | tiktok | youtube | twitter
  region            TEXT,             -- US | IN | UK | AU | CA | DE | FR | JP | BR | SG
  category          TEXT,             -- beauty | fashion | fitness | food | ...
  embedding         vector(384)       -- HNSW cosine index
);
```

## Deployment

```
User → Vercel (Next.js UI)
         ↓
      Railway (Express API)
         ↓
      Supabase (PostgreSQL + pgvector)
```

| Service | Platform | Cost |
|---------|----------|------|
| UI (Next.js) | [Vercel](https://vercel.com) | Free |
| API (Express) | [Railway](https://railway.app) | Free tier |
| Database (pgvector) | [Supabase](https://supabase.com) | Free tier |

## Environment Variables

```env
# Backend (.env)
DB_URL=postgresql://postgres:postgres@localhost:5433/v2v
PORT=3000

# UI (ui/.env.local)
BACKEND_URL=http://localhost:3000
```
