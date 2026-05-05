"use client";

import { Search, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function SearchBar({ value, onChange, onSearch, loading }: Props) {
  return (
    <div className="relative flex gap-3">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg2)]">
        <Search size={18} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder='Search by niche, content style, audience… e.g. "skincare for Gen Z"'
        className="input-field flex-1 rounded-2xl py-4 pl-11 pr-5 text-sm"
      />

      <button
        onClick={onSearch}
        disabled={loading || !value.trim()}
        className="btn-glow shrink-0 rounded-2xl px-4 sm:px-7 py-4 text-sm font-semibold text-white"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" />
            Searching
          </span>
        ) : (
          "Search"
        )}
      </button>
    </div>
  );
}
