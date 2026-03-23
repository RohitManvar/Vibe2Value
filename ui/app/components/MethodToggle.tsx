"use client";

type Method = "weighted" | "rrf";

const OPTIONS = [
  { value: "weighted" as Method, label: "Weighted", desc: "Semantic × GMV blend" },
  { value: "rrf"      as Method, label: "RRF",      desc: "Reciprocal rank fusion" },
];

interface Props {
  value: Method;
  onChange: (v: Method) => void;
}

export default function MethodToggle({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg2)]">
        Ranking Method
      </label>
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-black/20 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-lg px-3 py-2.5 text-center transition-all ${
              value === o.value
                ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] text-white shadow-lg"
                : "text-[var(--fg2)] hover:text-[var(--fg)]"
            }`}
          >
            <p className="text-xs font-semibold">{o.label}</p>
            <p className="text-[10px] opacity-70 mt-0.5">{o.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
