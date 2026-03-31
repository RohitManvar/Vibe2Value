"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowLeft } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-[var(--fg)]">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="glass rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-[var(--fg)] hover:bg-white/4 transition-colors"
          >
            <span>{item.q}</span>
            <ChevronDown
              size={16}
              className="shrink-0 ml-3 text-[var(--fg2)] transition-transform duration-200"
              style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {open === i && (
            <p className="px-5 pb-4 text-sm text-[var(--fg2)] leading-relaxed border-t border-[var(--border)] pt-3">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Card({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex gap-4">
      <div className="text-2xl shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-semibold text-[var(--fg)] text-sm mb-1">{title}</p>
        <p className="text-sm text-[var(--fg2)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold text-white"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent2))" }}
      >
        {n}
      </div>
      <div>
        <p className="font-semibold text-[var(--fg)] text-sm">{title}</p>
        <p className="text-sm text-[var(--fg2)] leading-relaxed mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="font-bold text-[var(--fg)] hover:text-[var(--accent3)] transition-colors">
            Vibe2Value
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--fg2)] hover:border-[var(--accent)]/40 hover:text-[var(--fg)] transition-all"
          >
            <ArrowLeft size={13} />
            Back to Search
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 flex flex-col gap-12">

        {/* Hero */}
        <div className="text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium text-[var(--accent3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent2)]" />
            How It Works
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            About <span className="gradient-text">Vibe2Value</span>
          </h1>
          <p className="max-w-xl text-[var(--fg2)] text-base leading-relaxed">
            A hybrid creator search engine that combines semantic understanding with real commercial performance data — so you find creators who don&apos;t just fit your brand, but actually drive sales.
          </p>
        </div>

        {/* Why */}
        <Section title="Why we built this">
          <p className="text-sm text-[var(--fg2)] leading-relaxed">
            Most creator discovery tools let you filter by follower count or category. That&apos;s not enough. A beauty creator with 50K followers who drives $80K GMV per month is worth more than a lifestyle creator with 500K followers who sells nothing.
          </p>
          <p className="text-sm text-[var(--fg2)] leading-relaxed">
            Vibe2Value was built for RoCathon to solve exactly this: match brand intent (semantics) with creator commercial reality (GMV) in a single ranked result.
          </p>
        </Section>

        {/* How it works */}
        <Section title="How the search works">
          <div className="flex flex-col gap-5 mt-1">
            <Step
              n={1}
              title="You type a natural language query"
              body='e.g. "skincare creator for Gen Z women" or "fitness influencer who sells supplements". No need for exact keywords.'
            />
            <Step
              n={2}
              title="Semantic embedding"
              body="Your query is converted to a 384-dimensional vector using the all-MiniLM-L6-v2 model. Every creator's bio and content tags are also embedded the same way."
            />
            <Step
              n={3}
              title="HNSW vector search"
              body="pgvector runs an approximate nearest-neighbour search using an HNSW index on Supabase. This finds the top creators whose content style most closely matches your query — in under 10ms."
            />
            <Step
              n={4}
              title="GMV scoring"
              body="Each creator gets a projected GMV score based on their 30-day earnings, engagement rate, average views, and gross profit margin. This is normalised so high-earners rank higher."
            />
            <Step
              n={5}
              title="Hybrid ranking"
              body="Final score = 40% semantic relevance + 60% projected GMV. You can also apply a Brand Profile filter which re-weights by audience match (gender, age range, industry)."
            />
          </div>
        </Section>

        {/* Scoring */}
        <Section title="The scoring formula">
          <div className="glass rounded-2xl p-5 font-mono text-sm leading-relaxed text-[var(--fg2)]">
            <span className="text-[var(--accent3)]">final_score</span>{" "}
            = 0.4 × <span className="text-[var(--fg)]">semantic_score</span>{" "}
            + 0.6 × <span className="text-[var(--green)]">projected_score</span>
            <br /><br />
            <span className="text-[var(--green)]">projected_score</span>{" "}
            = normalize(<br />
            {"  "}gmv_30d × engagement_rate × avg_views × gpm<br />
            )
          </div>
          <p className="text-xs text-[var(--fg2)] leading-relaxed">
            The 60/40 split was chosen because brand ROI is the primary goal. Semantic match ensures relevance; GMV weight ensures commercial viability. Both are normalised to [0, 1] before combining.
          </p>
        </Section>

        {/* Data */}
        <Section title="The data">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { v: "685", l: "Creators indexed" },
              { v: "4", l: "Platforms" },
              { v: "11", l: "Categories" },
            ].map(({ v, l }) => (
              <div key={l} className="glass rounded-2xl p-5 text-center">
                <p className="text-3xl font-black gradient-text">{v}</p>
                <p className="text-xs text-[var(--fg2)] mt-1">{l}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--fg2)] leading-relaxed">
            The dataset merges 186 real RoCathon GMV records with 500 synthetic creator profiles covering Instagram, TikTok, YouTube, and Twitter across regions including US, UK, India, Brazil, and more.
          </p>
        </Section>

        {/* Tech stack */}
        <Section title="Tech stack">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card icon="🧠" title="Semantic Search" body="all-MiniLM-L6-v2 via HuggingFace Transformers.js — 384-dim embeddings, runs server-side." />
            <Card icon="⚡" title="Vector DB" body="pgvector on Supabase with HNSW index. Sub-10ms ANN search across 685 creators." />
            <Card icon="🖥️" title="Backend" body="Node.js + Express + TypeScript, deployed on Railway. Handles search, filters, and meta endpoints." />
            <Card icon="🎨" title="Frontend" body="Next.js 16 App Router with Tailwind CSS v4. Dark glass-morphism design with green accent theme." />
            <Card icon="📊" title="Scoring" body="Custom hybrid ranking: 40% semantic cosine similarity + 60% normalised projected GMV." />
            <Card icon="🔍" title="Filters" body="Platform, category, and region filters with auto-search trigger on selection." />
          </div>
        </Section>

        {/* Glossary */}
        <Section title="Glossary — key terms explained">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                term: "GMV",
                full: "Gross Merchandise Value",
                def: "Total sales revenue a creator drives over a period. A creator with $80K GMV in 30 days generated $80K worth of purchases through their content. This is the primary commercial signal Vibe2Value uses.",
              },
              {
                term: "RRF",
                full: "Reciprocal Rank Fusion",
                def: "An alternative ranking method that combines two separate ranked lists (semantic rank + GMV rank) by taking the reciprocal of each rank and summing them. More robust to outliers than direct score weighting.",
              },
              {
                term: "Semantic Search",
                full: "Meaning-based search",
                def: "Instead of matching keywords, semantic search converts your query into a vector (a list of numbers representing meaning) and finds creators whose bio/tags have a similar vector. 'skincare' and 'beauty routine' will match even if those exact words don't appear.",
              },
              {
                term: "HNSW",
                full: "Hierarchical Navigable Small World",
                def: "A graph-based algorithm for fast approximate nearest-neighbour (ANN) search in high-dimensional vector space. Used by pgvector to find the most similar creator vectors in under 10ms across 685 creators.",
              },
              {
                term: "Embedding",
                full: "Vector representation of text",
                def: "A 384-dimensional numeric vector that encodes the meaning of a piece of text. Generated by the all-MiniLM-L6-v2 model. Two texts with similar meanings will have vectors that are close together (high cosine similarity).",
              },
              {
                term: "GPM",
                full: "Gross Profit Margin",
                def: "Revenue minus cost of goods sold, expressed as a percentage. Creators with high GPM products (e.g. digital goods, supplements) contribute more commercial value per sale, boosting their projected score.",
              },
              {
                term: "Cosine Similarity",
                full: "Vector similarity metric",
                def: "A measure of how similar two vectors are, regardless of their magnitude. Score of 1.0 = identical direction (perfect match), 0.0 = orthogonal (no overlap), -1.0 = opposite. Used to compare query embedding vs creator embedding.",
              },
              {
                term: "ANN",
                full: "Approximate Nearest Neighbour",
                def: "A fast search technique that finds vectors close to a query vector without checking every single entry. Trades a tiny bit of accuracy for massive speed gains — essential for real-time search at scale.",
              },
            ].map(({ term, full, def }) => (
              <div key={term} className="glass rounded-2xl p-4 flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-[var(--accent3)] text-sm font-mono">{term}</span>
                  <span className="text-[10px] text-[var(--fg2)]">{full}</span>
                </div>
                <p className="text-xs text-[var(--fg2)] leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* FAQ */}
        <Section title="Frequently asked questions">
          <FAQ items={[
            {
              q: "Why does a smaller creator sometimes rank higher than a bigger one?",
              a: "Because 60% of the final score is based on projected GMV (commercial output), not follower count. A 20K creator with a 12% engagement rate and $60K monthly GMV will outrank a 500K creator with 0.5% engagement and $5K GMV. Follower count alone is a vanity metric.",
            },
            {
              q: "What is the difference between Weighted and RRF ranking methods?",
              a: "Weighted combines scores directly: final = 0.4 × semantic + 0.6 × GMV. RRF (Reciprocal Rank Fusion) instead combines ranked positions — it takes 1/(rank + 60) for each method and sums them. RRF is more robust when one signal has extreme outliers.",
            },
            {
              q: "How do I pick the right Brand Profile?",
              a: "Pick the profile closest to your brand's industry and target audience. Smart Home targets female 25-44. Active Life targets male 18-34 for sports/fitness. Glow Beauty targets female 18-34 for beauty/fashion. Leaving it empty runs a pure semantic+GMV search with no demographic re-weighting.",
            },
            {
              q: "What does the semantic score actually measure?",
              a: "Cosine similarity between your query's 384-dim embedding and the creator's bio+tags embedding. A score of 0.9 means the creator's content very closely matches the meaning of your query. A score of 0.3 means weak topical overlap.",
            },
            {
              q: "How do filters interact with each other?",
              a: "Within a filter group (e.g. platforms), multiple selections are OR — selecting Instagram + TikTok returns creators on either platform. Across groups, selections are AND — Platform=TikTok + Category=Beauty only returns TikTok beauty creators.",
            },
            {
              q: "Can I search in languages other than English?",
              a: "The all-MiniLM-L6-v2 model is primarily trained on English text. Non-English queries may still return results but semantic accuracy will be lower. For best results, use English queries.",
            },
            {
              q: "How often is the creator data updated?",
              a: "The current deployment uses a static seed of 685 creators. In a production setup, this would sync with live TikTok Shop GMV data, creator API feeds, and engagement analytics on a daily or weekly basis.",
            },
          ]} />
        </Section>

        {/* Built for */}
        <div className="glass rounded-2xl p-6 text-center flex flex-col items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--fg2)]">Built for</p>
          <p className="text-2xl font-black gradient-text">RoCathon</p>
          <p className="text-sm text-[var(--fg2)] max-w-md leading-relaxed">
            A hackathon challenge to build a creator-brand matching engine using real GMV data. Vibe2Value ranked creators by commercial potential, not just follower count.
          </p>
          <Link
            href="/"
            className="btn-glow mt-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
          >
            Try the search →
          </Link>
        </div>

      </div>
    </div>
  );
}
