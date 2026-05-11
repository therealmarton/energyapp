import { CalendarRange } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useDateWindow } from "../../stores/useDateWindow";

export function DateRangePicker() {
  const { t } = useTranslation();
  const { start, end, setStart, setEnd, applyPreset } = useDateWindow();

  return (
    <div
      className="flex items-center gap-2 border border-slate-200 rounded-lg bg-white px-2 py-1 shadow-sm"
      data-testid="filter-bar"
    >
      <CalendarRange size={16} className="text-slate-400" />
      <input
        type="date"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="bg-transparent text-sm focus:outline-none tabular-nums"
        aria-label={t("filters.start")}
        data-testid="filter-start"
      />
      <span className="text-slate-300">→</span>
      <input
        type="date"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="bg-transparent text-sm focus:outline-none tabular-nums"
        aria-label={t("filters.end")}
        data-testid="filter-end"
      />
      <div className="hidden sm:flex items-center gap-1 pl-2 ml-1 border-l border-slate-200">
        {(["day", "week", "month", "year"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            className="text-[11px] uppercase tracking-wide text-slate-500 hover:text-brand-700 hover:bg-brand-50 px-1.5 py-0.5 rounded"
            data-testid={`preset-${p}`}
          >
            {t(`filters.preset.${p}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
