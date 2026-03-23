"use client";

import { BRAND_PROFILES } from "@/lib/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function BrandSelector({ value, onChange }: Props) {
  const selected = value ? BRAND_PROFILES[value] : null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg2)]">
        Brand Profile
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-full appearance-none rounded-xl px-4 py-3 text-sm pr-9 cursor-pointer"
        >
          <option value="">No brand filter</option>
          {Object.values(BRAND_PROFILES).map((b) => (
            <option key={b.id} value={b.id}>{b.label} · {b.industries.join(", ")}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg2)]" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      {selected && (
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-0.5 text-[11px] text-[var(--accent3)]">
            {selected.target_audience.gender}
          </span>
          {selected.target_audience.age_ranges.map(a => (
            <span key={a} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] text-[var(--fg2)]">{a}</span>
          ))}
          <span className="rounded-full bg-[var(--green)]/10 border border-[var(--green)]/20 px-2.5 py-0.5 text-[11px] text-[var(--green)]">
            GMV ${(selected.gmv / 1000).toFixed(0)}K
          </span>
        </div>
      )}
    </div>
  );
}
