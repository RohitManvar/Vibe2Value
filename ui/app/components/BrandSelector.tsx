"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { BRAND_PROFILES } from "@/lib/types";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function BrandSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? BRAND_PROFILES[value] : null;

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = [
    { id: "", label: "No brand filter", sub: "" },
    ...Object.values(BRAND_PROFILES).map((b) => ({
      id: b.id,
      label: b.label,
      sub: b.industries.join(", "),
    })),
  ];

  const current = options.find((o) => o.id === value) ?? options[0];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg2)]">
        Brand Profile
      </label>

      <div className="relative" ref={ref}>
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="input-field w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm cursor-pointer text-left"
        >
          <span className={current.id ? "text-[var(--fg)]" : "text-[var(--fg2)]/60"}>
            {current.id ? `${current.label} · ${current.sub}` : "No brand filter"}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 ml-2 text-[var(--fg2)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className="dropdown-panel absolute left-0 right-0 top-[calc(100%+6px)] z-50">
            {options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(o.id); setOpen(false); }}
                className={`dropdown-option flex flex-col text-sm ${o.id === value ? "active" : ""}`}
              >
                <span className="font-medium">{o.label}</span>
                {o.sub && (
                  <span className="text-[11px] mt-0.5" style={{ color: "var(--fg2)" }}>{o.sub}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected brand chips */}
      {selected && (
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-0.5 text-[11px] text-[var(--accent3)]">
            {selected.target_audience.gender}
          </span>
          {selected.target_audience.age_ranges.map((a) => (
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
