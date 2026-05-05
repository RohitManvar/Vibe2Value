"use client";

import { useState, useRef, useEffect } from "react";
import { Info, X } from "lucide-react";
import type { RankedCreator } from "@/lib/types";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  tiktok:    "#69c9d0",
  youtube:   "#ff4444",
  twitter:   "#1da1f2",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  beauty: "✨", fashion: "👗", fitness: "💪", food: "🍜",
  gaming: "🎮", lifestyle: "🌿", music: "🎵", sports: "⚽",
  tech: "💻", travel: "✈️", education: "📚",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

function ScoreRow({
  label, value, max = 1, color,
}: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[11px] text-[var(--fg2)]">{label}</span>
      <div className="flex-1 h-1 rounded-full bg-white/5">
        <div
          className="score-bar h-1 rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-10 text-right font-mono text-[11px] text-[var(--fg)]">{value.toFixed(3)}</span>
    </div>
  );
}

function ScoreExplainer({ scores, onClose }: { scores: RankedCreator["scores"]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-72 rounded-2xl border border-[var(--accent)]/20 p-4 flex flex-col gap-3"
      style={{ background: "#0d0d1a", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--fg)]">Score breakdown</p>
        <button onClick={onClose} className="rounded-lg p-1 text-[var(--fg2)] hover:text-[var(--fg)] transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <div>
          <ScoreRow label="Semantic" value={scores.semantic_score} color="var(--accent3)" />
          <p className="mt-1 text-[10px] text-[var(--fg2)] pl-[76px]">
            How well this creator matches your query · <span className="text-[var(--fg)]">40% weight</span>
          </p>
        </div>
        <div>
          <ScoreRow label="Projected" value={scores.projected_score} color="var(--green)" />
          <p className="mt-1 text-[10px] text-[var(--fg2)] pl-[76px]">
            GMV × engagement × views × GPM · <span className="text-[var(--fg)]">60% weight</span>
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-black/30 px-3 py-2.5 font-mono text-[11px] border border-white/5">
        <span className="text-[var(--fg2)]">0.4 × </span>
        <span className="text-[var(--accent3)]">{scores.semantic_score.toFixed(3)}</span>
        <span className="text-[var(--fg2)]"> + 0.6 × </span>
        <span className="text-[var(--green)]">{scores.projected_score.toFixed(3)}</span>
        <span className="text-[var(--fg2)]"> = </span>
        <span className="text-white font-bold">{scores.final_score.toFixed(3)}</span>
      </div>

      <p className="text-[10px] text-[var(--fg2)]/60">All scores are normalised to [0, 1]</p>
    </div>
  );
}

interface Props {
  creator: RankedCreator;
  style?: React.CSSProperties;
}

export default function CreatorCard({ creator, style }: Props) {
  const { username, bio, content_style_tags, metrics, scores, rank, platform, region, category } = creator;
  const pColor = PLATFORM_COLORS[platform] ?? "#888";
  const catEmoji = CATEGORY_EMOJIS[category] ?? "🎯";
  const initials = username.slice(0, 2).toUpperCase();
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div
      className="glass glass-hover fade-up rounded-2xl p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(5,150,105,0.12)] hover:-translate-y-0.5 cursor-default"
      style={style}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, var(--accent), var(--accent2))` }}
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-semibold text-[var(--fg)] text-sm truncate">@{username}</p>
              <span className="shrink-0 rounded-lg bg-white/8 px-1.5 py-0.5 text-[10px] font-bold text-[var(--fg2)]">
                #{rank}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs text-[var(--fg2)]">{fmt(metrics.follower_count)} followers</span>
              {platform && (
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize"
                  style={{ background: pColor + "18", color: pColor, border: `1px solid ${pColor}30` }}
                >
                  {platform}
                </span>
              )}
              {region && (
                <span className="rounded-md border border-white/8 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-[var(--fg2)]">
                  {region}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Final score + explainer */}
        <div className="relative text-right shrink-0">
          <p
            className="text-xl font-black"
            style={{ background: "linear-gradient(135deg, #fff, var(--accent3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {scores.final_score.toFixed(3)}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setShowExplainer((o) => !o); }}
            className="flex items-center gap-1 mx-auto mt-0.5 text-[10px] text-[var(--fg2)] hover:text-[var(--accent3)] transition-colors"
          >
            <Info size={11} />
            final score
          </button>
          {showExplainer && (
            <ScoreExplainer scores={scores} onClose={() => setShowExplainer(false)} />
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-[var(--fg2)] leading-relaxed line-clamp-2 border-l-2 border-[var(--accent)]/30 pl-3">
        {bio}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {category && (
          <span className="flex items-center gap-1 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-1 text-[11px] font-semibold text-[var(--accent3)]">
            {catEmoji} {category}
          </span>
        )}
        {content_style_tags
          .filter((t) => t !== category)
          .slice(0, 4)
          .map((tag) => (
            <span key={tag} className="rounded-xl border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] text-[var(--fg2)]">
              {tag}
            </span>
          ))}
      </div>

      {/* Score breakdown */}
      <div className="flex flex-col gap-2 rounded-xl bg-black/20 p-3">
        <ScoreRow label="Semantic"  value={scores.semantic_score}  color="var(--accent3)" />
        <ScoreRow label="Projected" value={scores.projected_score} color="var(--green)" />
        <ScoreRow label="Final"     value={scores.final_score}     color="var(--accent3)" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { v: `$${fmt(metrics.total_gmv_30d)}`, l: "GMV 30d", c: "var(--green)" },
          { v: fmt(metrics.avg_views_30d),        l: "Avg Views", c: "var(--fg)" },
          { v: `${(metrics.engagement_rate * 100).toFixed(1)}%`, l: "Engagement", c: "var(--accent3)" },
        ].map(({ v, l, c }) => (
          <div key={l} className="rounded-xl bg-white/4 border border-white/5 p-2.5 text-center">
            <p className="text-xs font-bold font-mono" style={{ color: c }}>{v}</p>
            <p className="text-[10px] text-[var(--fg2)] mt-0.5">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
