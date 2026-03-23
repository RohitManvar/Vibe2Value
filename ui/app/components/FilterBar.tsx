"use client";

import type { MetaResponse } from "@/lib/types";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "#e1306c",
  tiktok:    "#69c9d0",
  youtube:   "#ff4444",
  twitter:   "#1da1f2",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG", tiktok: "TK", youtube: "YT", twitter: "TW",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  beauty: "✨", fashion: "👗", fitness: "💪", food: "🍜",
  gaming: "🎮", lifestyle: "🌿", music: "🎵", sports: "⚽",
  tech: "💻", travel: "✈️", education: "📚",
};

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
  icon?: string;
  emoji?: string;
}

function FilterChip({ label, count, active, onClick, color, icon, emoji }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        active ? "chip-active" : "border-[var(--border)] text-[var(--fg2)] hover:border-[var(--border2)] hover:text-[var(--fg)] hover:bg-white/5"
      }`}
      style={active && color ? { borderColor: color + "50", color, boxShadow: `0 0 12px ${color}25` } : undefined}
    >
      {emoji && <span className="text-sm leading-none">{emoji}</span>}
      {icon && !emoji && (
        <span
          className="rounded px-1 py-0.5 text-[10px] font-bold leading-none"
          style={{ background: (color ?? "#888") + "30", color: color ?? "#888" }}
        >
          {icon}
        </span>
      )}
      <span className="capitalize">{label}</span>
      <span className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${active ? "bg-white/20" : "bg-white/8 text-[var(--fg2)]"}`}>
        {count}
      </span>
    </button>
  );
}

interface SectionProps { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg2)]/60">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

interface Props {
  meta: MetaResponse | null;
  selectedPlatforms: string[];
  selectedRegions: string[];
  selectedCategories: string[];
  onTogglePlatform: (v: string) => void;
  onToggleRegion: (v: string) => void;
  onToggleCategory: (v: string) => void;
}

export default function FilterBar({
  meta, selectedPlatforms, selectedRegions, selectedCategories,
  onTogglePlatform, onToggleRegion, onToggleCategory,
}: Props) {
  if (!meta) return null;

  const total = selectedPlatforms.length + selectedRegions.length + selectedCategories.length;

  const clearAll = () => {
    [...selectedPlatforms].forEach(onTogglePlatform);
    [...selectedRegions].forEach(onToggleRegion);
    [...selectedCategories].forEach(onToggleCategory);
  };

  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--fg)]">Filters</p>
        {total > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-2.5 py-1 text-[11px] text-[var(--accent3)] hover:bg-[var(--accent)]/20 transition-colors"
          >
            Clear {total}
          </button>
        )}
      </div>

      <Section title="Platform">
        {meta.platforms.map((p) => (
          <FilterChip
            key={p.value} label={p.value} count={p.count}
            active={selectedPlatforms.includes(p.value)}
            onClick={() => onTogglePlatform(p.value)}
            color={PLATFORM_COLORS[p.value]}
            icon={PLATFORM_ICONS[p.value]}
          />
        ))}
      </Section>

      <Section title="Category">
        {meta.categories.map((c) => (
          <FilterChip
            key={c.value} label={c.value} count={c.count}
            active={selectedCategories.includes(c.value)}
            onClick={() => onToggleCategory(c.value)}
            emoji={CATEGORY_EMOJIS[c.value]}
          />
        ))}
      </Section>

      <Section title="Region">
        {meta.regions.map((r) => (
          <FilterChip
            key={r.value} label={r.value} count={r.count}
            active={selectedRegions.includes(r.value)}
            onClick={() => onToggleRegion(r.value)}
          />
        ))}
      </Section>
    </div>
  );
}
