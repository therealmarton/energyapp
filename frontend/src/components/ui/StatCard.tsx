import type { ReactNode } from "react";
import clsx from "clsx";

interface Props {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "savings" | "solar" | "grid" | "brand";
  "data-testid"?: string;
}

const tones = {
  neutral: "bg-white border-slate-200",
  savings: "bg-gradient-to-br from-emerald-50 to-white border-emerald-200",
  solar: "bg-gradient-to-br from-amber-50 to-white border-amber-200",
  grid: "bg-gradient-to-br from-slate-50 to-white border-slate-200",
  brand: "bg-gradient-to-br from-brand-50 to-white border-brand-200",
};

const iconTones = {
  neutral: "bg-slate-100 text-slate-600",
  savings: "bg-emerald-100 text-emerald-700",
  solar: "bg-amber-100 text-amber-700",
  grid: "bg-slate-200 text-slate-700",
  brand: "bg-brand-100 text-brand-700",
};

export function StatCard({ label, value, hint, icon, tone = "neutral", ...rest }: Props) {
  return (
    <div
      className={clsx("rounded-xl border shadow-card p-5", tones[tone])}
      data-testid={rest["data-testid"]}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide font-medium text-slate-500">{label}</div>
        {icon && (
          <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", iconTones[tone])}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
