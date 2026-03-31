"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Target, SlidersHorizontal, BarChart3, Lightbulb, TrendingUp, Users, Zap } from "lucide-react";

const EXAMPLES = [
  "skincare creator for Gen Z women",
  "fitness influencer who sells supplements",
  "tech reviewer on YouTube who unboxes gadgets",
  "food creator for Indian cuisine recipes",
  "fashion creator for streetwear brands",
  "gaming influencer for mobile game promotions",
  "travel creator focused on budget backpacking",
  "beauty creator for drugstore makeup reviews",
];

function QueryExample({ bad, good }: { bad: string; good: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-red-500/10 border border-red-500/20 p-1.5">
          <span className="text-red-400 text-xs font-bold">✗</span>
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400/70 mb-1">Too vague</p>
          <p className="text-sm text-[var(--fg2)] font-mono">"{bad}"</p>
        </div>
      </div>
      <div className="border-t border-[var(--border)]" />
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-1.5">
          <span className="text-[var(--accent3)] text-xs font-bold">✓</span>
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent3)]/70 mb-1">Better query</p>
          <p className="text-sm text-[var(--fg)] font-mono">"{good}"</p>
        </div>
      </div>
    </div>
  );
}

function TipCard({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex gap-4">
      <div className="shrink-0 mt-0.5 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-2.5">
        <Icon size={16} className="text-[var(--accent3)]" />
      </div>
      <div>
        <p className="font-semibold text-[var(--fg)] text-sm mb-1">{title}</p>
        <p className="text-sm text-[var(--fg2)] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-[var(--fg)]">{title}</h2>
      {children}
    </div>
  );
}

export default function TipsPage() {
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
            <Lightbulb size={12} />
            Search Tips
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Get <span className="gradient-text">better results</span>
          </h1>
          <p className="max-w-xl text-[var(--fg2)] text-base leading-relaxed">
            Vibe2Value understands natural language. The more specific and descriptive your query, the better the semantic match.
          </p>
        </div>

        {/* Writing good queries */}
        <Section title="Writing good queries">
          <p className="text-sm text-[var(--fg2)] leading-relaxed">
            Don&apos;t use single keywords. Describe what you&apos;re looking for as if you&apos;re explaining it to a colleague.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QueryExample bad="beauty creator" good="Gen Z skincare creator who reviews drugstore products" />
            <QueryExample bad="fitness" good="female fitness influencer for supplement brand, 18-34 age group" />
            <QueryExample bad="youtube tech" good="tech reviewer on YouTube who unboxes smart home devices" />
          </div>
        </Section>

        {/* General tips */}
        <Section title="Tips for better searches">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TipCard
              icon={Users}
              title="Describe the audience"
              body="Include the target audience in your query. 'Gen Z women', '25-34 male gamers', 'budget-conscious students' all improve matching."
            />
            <TipCard
              icon={Target}
              title="Mention the goal"
              body="Include the brand goal. 'for supplement sales', 'for app downloads', 'for brand awareness' helps rank by commercial fit."
            />
            <TipCard
              icon={Sparkles}
              title="Include content style"
              body="Words like 'unboxing', 'reviews', 'tutorials', 'lifestyle vlogs', 'outfit hauls' map directly to creator content tags."
            />
            <TipCard
              icon={Zap}
              title="Combine niches"
              body="'fitness + nutrition creator' or 'tech + travel influencer' — the model handles multi-niche queries well."
            />
          </div>
        </Section>

        {/* Using Brand Profiles */}
        <Section title="Using Brand Profiles">
          <p className="text-sm text-[var(--fg2)] leading-relaxed">
            Brand Profiles re-weight results to favour creators whose audience demographics match your brand. The final score shifts to prioritise audience fit on top of GMV.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Smart Home", emoji: "🏠", desc: "Targets female 25-44. Use for home appliance, IoT, or interior design brands.", gmv: "$75K" },
              { label: "Active Life", emoji: "💪", desc: "Targets male 18-34. Best for sports gear, fitness apps, or supplement brands.", gmv: "$50K" },
              { label: "Glow Beauty", emoji: "✨", desc: "Targets female 18-34. Ideal for beauty, skincare, fashion, or cosmetics brands.", gmv: "$60K" },
            ].map((b) => (
              <div key={b.label} className="glass rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{b.emoji}</span>
                  <p className="font-semibold text-[var(--fg)] text-sm">{b.label}</p>
                  <span className="ml-auto text-[10px] font-bold text-[var(--green)]">{b.gmv} GMV</span>
                </div>
                <p className="text-xs text-[var(--fg2)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Using Filters */}
        <Section title="Using filters effectively">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TipCard
              icon={SlidersHorizontal}
              title="Platform filter"
              body="Pick a specific platform if your campaign is platform-specific. Leaving it empty searches across all platforms."
            />
            <TipCard
              icon={Target}
              title="Multiple filters"
              body="Selecting multiple chips within a group is OR (Instagram OR TikTok). Across groups it is AND (TikTok AND Beauty AND US)."
            />
            <TipCard
              icon={TrendingUp}
              title="Filters auto-trigger"
              body="Filters apply instantly if you already have search results. No need to click Search again after changing filters."
            />
            <TipCard
              icon={BarChart3}
              title="Region filter"
              body="Use the region filter when your campaign targets a specific country or market (US, UK, IN, BR, etc.)."
            />
          </div>
        </Section>

        {/* Understanding scores */}
        <Section title="Understanding the scores">
          <div className="glass rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[var(--accent3)]" style={{ width: "40%" }} />
                  <span className="text-xs text-[var(--fg2)]">40% Semantic</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-2 rounded-full bg-[var(--green)]" style={{ width: "60%" }} />
                  <span className="text-xs text-[var(--fg2)]">60% GMV Score</span>
                </div>
              </div>
              <p className="text-xs text-[var(--fg2)] leading-relaxed">
                A score of <span className="text-[var(--fg)] font-mono">0.850</span> means this creator is both a strong semantic match for your query AND has high projected commercial value. A score of <span className="text-[var(--fg)] font-mono">0.400</span> might mean good relevance but lower GMV, or vice versa. Click the <span className="text-[var(--accent3)] font-mono">ⓘ</span> icon on any card to see the exact breakdown.
              </p>
            </div>
          </div>
        </Section>

        {/* Quick examples */}
        <Section title="Try these example searches">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((q) => (
              <Link
                key={q}
                href={`/?q=${encodeURIComponent(q)}`}
                className="rounded-xl border border-[var(--border)] bg-white/3 px-3 py-1.5 text-[11px] font-medium text-[var(--fg2)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/8 hover:text-[var(--accent3)]"
              >
                {q}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--fg2)]">Clicking a chip takes you directly to search results.</p>
        </Section>

      </div>
    </div>
  );
}
