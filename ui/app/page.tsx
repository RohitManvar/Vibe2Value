"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { SlidersHorizontal, AlertCircle, Map, Library } from "lucide-react";
import SearchBar from "./components/SearchBar";
import BrandSelector from "./components/BrandSelector";
import MethodToggle from "./components/MethodToggle";
import CreatorCard from "./components/CreatorCard";
import StatsBar from "./components/StatsBar";
import FilterBar from "./components/FilterBar";
import Tour from "./components/Tour";
import type { SearchResponse, MetaResponse } from "@/lib/types";

const EXAMPLES = [
  { label: "Home Decor", q: "Affordable home decor for small apartments" },
  { label: "Skincare", q: "Skincare routine for sensitive skin" },
  { label: "Fitness", q: "Budget gym workout no equipment" },
  { label: "Food", q: "Street food recipes under 15 minutes" },
  { label: "AI / ML", q: "Machine learning for beginners" },
  { label: "Fashion", q: "Sustainable fashion on a budget" },
  { label: "Travel", q: "Solo backpacker travel hacks" },
  { label: "Gaming", q: "Indie game development tips" },
];

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

function HomeInner() {
  const [query, setQuery]             = useState("");
  const [brand, setBrand]             = useState("");
  const [method, setMethod]           = useState<"weighted" | "rrf">("weighted");
  const [limit, setLimit]             = useState(10);
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<SearchResponse | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [meta, setMeta]               = useState<MetaResponse | null>(null);
  const [selPlatforms, setSelPlatforms]   = useState<string[]>([]);
  const [selRegions, setSelRegions]       = useState<string[]>([]);
  const [selCategories, setSelCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/search/meta")
      .then((r) => r.json())
      .then((d: MetaResponse) => setMeta(d))
      .catch(() => null);
  }, []);

  const handleSearch = useCallback(async (overrideQuery?: string) => {
    const q = overrideQuery ?? query;
    if (!q.trim()) return;
    if (overrideQuery) setQuery(overrideQuery);
    setLoading(true); setError(null); setResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.trim(), brand: brand || undefined, limit, method,
          ...(selPlatforms.length  && { platforms:   selPlatforms }),
          ...(selRegions.length    && { regions:      selRegions }),
          ...(selCategories.length && { categories:   selCategories }),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Search failed");
      else setResult(data as SearchResponse);
    } catch {
      setError("Could not reach the backend. Is the Express server running?");
    } finally {
      setLoading(false);
    }
  }, [query, brand, method, limit, selPlatforms, selRegions, selCategories]);

  // Auto-search when filters change if a query is already set
  useEffect(() => {
    if (query.trim()) handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selPlatforms, selRegions, selCategories]);

  const activeFilters = selPlatforms.length + selRegions.length + selCategories.length;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Handle ?q= param from Tips page
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) { setQuery(q); handleSearch(q); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-show tour on first visit
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("tourSeen")) {
      setTourActive(true);
      localStorage.setItem("tourSeen", "true");
    }
  }, []);

  return (
    <div className="relative z-10 min-h-screen">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[var(--fg)]">Vibe2Value</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tips" className="text-xs font-medium text-[var(--fg2)] hover:text-[var(--accent3)] transition-colors">
              Tips
            </Link>
            <Link href="/about" className="text-xs font-medium text-[var(--fg2)] hover:text-[var(--accent3)] transition-colors">
              About
            </Link>
            <div className="flex items-center gap-2 text-xs text-[var(--fg2)]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--green)] shadow-[0_0_6px_var(--green)]" />
              <span>{meta?.total.toLocaleString() ?? "—"} creators</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        {/* ── Hero ── */}
        <div className="py-10 sm:py-14 text-center flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/8 px-4 py-1.5 text-xs font-medium text-[var(--accent3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent2)]" />
            Hybrid Semantic × Commercial Ranking
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl">
            Find creators that{" "}
            <span className="gradient-text">actually convert</span>
          </h1>

          <p className="text-[var(--fg2)] text-base max-w-xl leading-relaxed">
            Search 685+ creators by content niche. Ranked by relevance
            <em className="text-[var(--fg)] not-italic font-medium"> and </em>
            commercial performance — not just follower count.
          </p>
          <button
            onClick={() => { setTourStep(0); setTourActive(true); }}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2 text-xs font-medium text-[var(--fg2)] hover:border-[var(--accent)]/40 hover:text-[var(--accent3)] transition-all"
          >
            <Map size={13} />
            Take a tour
          </button>
        </div>

        {/* Tour overlay */}
        {tourActive && (
          <Tour
            step={tourStep}
            onNext={() => setTourStep((s) => s + 1)}
            onBack={() => setTourStep((s) => s - 1)}
            onClose={() => setTourActive(false)}
          />
        )}

        {/* ── Stats bar ── */}
        <div className="mb-6">
          <StatsBar meta={meta} />
        </div>

        {/* ── Search box ── */}
        <div className="glass rounded-3xl p-6 mb-6 shadow-[0_0_60px_var(--glow2)]">
          <SearchBar value={query} onChange={setQuery} onSearch={() => handleSearch()} loading={loading} />

          {/* Example chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[11px] text-[var(--fg2)] self-center mr-1">Try:</span>
            {EXAMPLES.map((e) => (
              <button
                key={e.q}
                onClick={() => handleSearch(e.q)}
                className="rounded-xl border border-[var(--border)] bg-white/3 px-3 py-1.5 text-[11px] font-medium text-[var(--fg2)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8 hover:text-[var(--accent3)]"
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Controls row */}
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <BrandSelector value={brand} onChange={setBrand} />
            </div>
            <MethodToggle value={method} onChange={setMethod} />
          </div>

          {/* Results count slider */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg2)] whitespace-nowrap">
              Results
            </span>
            <input
              type="range" min={5} max={20} step={5} value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="flex-1 h-1 accent-[#059669] cursor-pointer"
            />
            <span className="w-6 text-right text-sm font-bold text-[var(--fg)]">{limit}</span>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ── Mobile filter toggle ── */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/5 px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters > 0 && (
              <span className="ml-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Results area ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar */}
          <aside className={`lg:w-64 lg:shrink-0 lg:sticky lg:top-[73px] w-full ${filtersOpen ? "block" : "hidden"} lg:block`}>
            <FilterBar
              meta={meta}
              selectedPlatforms={selPlatforms}
              selectedRegions={selRegions}
              selectedCategories={selCategories}
              onTogglePlatform={(v) => setSelPlatforms((p) => toggle(p, v))}
              onToggleRegion={(v) => setSelRegions((p) => toggle(p, v))}
              onToggleCategory={(v) => setSelCategories((p) => toggle(p, v))}
            />
            {activeFilters > 0 && (
              <p className="mt-3 text-center text-[11px] text-[var(--accent3)]">
                {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
              </p>
            )}
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {result && (
              <div className="flex flex-col gap-5">
                {/* Result meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[var(--fg)]">
                      {result.total} results
                    </span>
                    <span className="rounded-lg bg-white/5 border border-white/8 px-2 py-0.5 text-[11px] text-[var(--fg2)]">
                      {result.latency_ms}ms
                    </span>
                  </div>
                  <p className="truncate max-w-xs text-xs italic text-[var(--fg2)]">
                    "{result.query}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {result.results.map((creator, i) => (
                    <CreatorCard
                      key={creator.username}
                      creator={creator}
                      style={{ animationDelay: `${i * 40}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-4 py-32">
                <div className="spinner" />
                <p className="text-sm text-[var(--fg2)]">Searching through 685 creators…</p>
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div className="flex flex-col items-center justify-center gap-5 py-28 text-center">
                <div
                  className="h-20 w-20 rounded-3xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--accent)/10, var(--accent2)/5)", border: "1px solid var(--accent)/20" }}
                >
                  <Library size={36} className="text-[var(--accent3)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--fg)]">Start your creator search</p>
                  <p className="mt-1 text-sm text-[var(--fg2)]">
                    Type a query above or click an example to get started
                  </p>
                </div>
                {activeFilters > 0 && (
                  <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/8 px-4 py-2 text-xs text-[var(--accent3)]">
                    {activeFilters} filter{activeFilters > 1 ? "s" : ""} will be applied to your next search
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-[11px] text-[var(--fg2)]/50">
        Vibe2Value · Hybrid Creator Search · Built for RoCathon
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
