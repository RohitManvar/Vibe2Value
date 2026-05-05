import type { MetaResponse } from "@/lib/types";

interface Props { meta: MetaResponse | null; }

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-white">{value}</span>
      <span className="text-xs text-[var(--fg2)]">{label}</span>
    </div>
  );
}

export default function StatsBar({ meta }: Props) {
  if (!meta) return (
    <div className="h-10 rounded-xl glass animate-pulse" />
  );

  return (
    <div className="glass rounded-xl px-4 sm:px-5 py-3 flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-2">
      <div className="flex items-center gap-2 mr-2">
        <div className="h-2 w-2 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)]" />
        <span className="text-[11px] font-medium text-[var(--green)]">Live</span>
      </div>
      <Stat value={meta.total.toLocaleString()} label="creators indexed" />
      <span className="text-[var(--border2)] hidden sm:inline">·</span>
      <Stat value={meta.platforms.length} label="platforms" />
      <span className="text-[var(--border2)] hidden sm:inline">·</span>
      <Stat value={meta.regions.length} label="regions" />
      <span className="text-[var(--border2)] hidden sm:inline">·</span>
      <Stat value={meta.categories.length} label="categories" />
      <span className="text-[var(--border2)] hidden sm:inline">·</span>
      <div className="flex flex-wrap gap-1.5">
        {meta.platforms.map((p) => (
          <span key={p.value} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-[var(--fg2)] capitalize">
            {p.value}
          </span>
        ))}
      </div>
    </div>
  );
}
