import type { PropsWithChildren } from "react";
import clsx from "clsx";

type Tone = "solar" | "grid" | "savings" | "neutral" | "brand";

const tones: Record<Tone, string> = {
  solar: "bg-amber-100 text-amber-800",
  grid: "bg-slate-200 text-slate-700",
  savings: "bg-emerald-100 text-emerald-800",
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-100 text-brand-800",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: PropsWithChildren<{ tone?: Tone; className?: string }>) {
  return <span className={clsx("pill", tones[tone], className)}>{children}</span>;
}
