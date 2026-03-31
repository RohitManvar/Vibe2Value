"use client";

import { useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Search, Sparkles, Building2, SlidersHorizontal, BarChart3 } from "lucide-react";

interface TourStep {
  icon: React.ElementType;
  title: string;
  body: string;
  position: "center" | "top" | "bottom";
}

const STEPS: TourStep[] = [
  {
    icon: Search,
    title: "Search in plain English",
    body: 'Type anything natural like "Gen Z skincare creator" or "fitness influencer who sells supplements". No keywords or hashtags needed.',
    position: "bottom",
  },
  {
    icon: Sparkles,
    title: "Try an example chip",
    body: "Not sure what to search? Click any of the example chips below the search bar to instantly run a pre-built query.",
    position: "bottom",
  },
  {
    icon: Building2,
    title: "Set a Brand Profile",
    body: "Select a brand to re-weight results by audience demographics. Smart Home, Active Life, or Glow Beauty — pick the closest match to your brand.",
    position: "bottom",
  },
  {
    icon: SlidersHorizontal,
    title: "Narrow with filters",
    body: "Use the sidebar to filter by platform (Instagram, TikTok…), category (beauty, fitness…), or region. Filters apply instantly.",
    position: "center",
  },
  {
    icon: BarChart3,
    title: "Read the score cards",
    body: "Each creator card shows a final score combining 40% semantic relevance and 60% projected GMV. Click ⓘ on any card to see the exact breakdown.",
    position: "center",
  },
];

interface Props {
  step: number;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
}

export default function Tour({ step, onNext, onBack, onClose }: Props) {
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Tour card */}
      <div
        className="fixed z-50 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"
        style={{ top: current.position === "bottom" ? "140px" : "50%", transform: current.position === "bottom" ? "translateX(-50%)" : "translate(-50%, -50%)" }}
      >
        <div className="glass rounded-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.8)] border border-[var(--accent)]/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-2.5">
                <Icon size={18} className="text-[var(--accent3)]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--fg2)]">
                  Step {step + 1} of {STEPS.length}
                </p>
                <p className="font-bold text-[var(--fg)] text-base">{current.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--fg2)] hover:bg-white/8 hover:text-[var(--fg)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <p className="text-sm text-[var(--fg2)] leading-relaxed mb-5">{current.body}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? "20px" : "6px",
                  background: i === step ? "var(--accent2)" : "rgba(255,255,255,0.12)",
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/5 px-3 py-2 text-xs font-medium text-[var(--fg2)] hover:text-[var(--fg)] transition-colors"
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}
            <button
              onClick={isLast ? onClose : onNext}
              className="btn-glow flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            >
              {isLast ? "Start searching" : "Next"}
              {!isLast && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
