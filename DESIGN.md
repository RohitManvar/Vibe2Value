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

I went with HNSW over IVFFlat mainly because IVFFlat needs a training step (clustering) before it can serve queries. HNSW just builds as you insert, which made the setup simpler. With 186 creators the dataset isn't huge, and HNSW with `m=16, ef_construction=128` gave me great recall with very fast query times.

---

## Embedding model

I used `all-MiniLM-L6-v2` from @xenova/transformers — it runs locally via ONNX so there's no API dependency or cost, and results are fully reproducible. 384 dimensions is compact enough that the cosine distance ops are fast.

For each creator I embed their bio plus their content tags together:
```
bio + "\nCategories: " + content_style_tags.join(", ")
```

This gives the model both the creator's story and their content focus in one vector.

---

## Results

Query: *"Affordable home decor for small apartments"* + brand_smart_home

All 10 results came back as Home/Design creators with GMV between $37K-$56K and strong demographic alignment with the brand's target (Female, 25-44). The scoring felt right — semantic relevance got rewarded without sacrificing commercial viability.

Latency averaged around 164ms per query including embedding + ANN search + re-ranking.
