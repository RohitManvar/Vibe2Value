"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export default function SearchBar({ value, onChange, onSearch, loading }: Props) {
  return (
    <div className="relative flex gap-3">
      {/* Search icon */}
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg2)]">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
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
        className="btn-glow shrink-0 rounded-2xl px-7 py-4 text-sm font-semibold text-white"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
            Searching
          </span>
        ) : (
          "Search"
        )}
      </button>
    </div>
  );
}
