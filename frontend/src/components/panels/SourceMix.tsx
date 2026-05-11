import { useTranslation } from "react-i18next";
import { Sun, Zap } from "lucide-react";

import { Card } from "../ui/Card";
import type { SettlementResponse } from "../../api";

interface Props {
  data: SettlementResponse;
}

export function SourceMix({ data }: Props) {
  const { t } = useTranslation();
  const latest = data.hourly.at(-1);
  const solarShare = latest
    ? Math.min(
        latest.community_demand_kwh > 0
          ? (Math.min(latest.community_supply_kwh, latest.community_demand_kwh) /
              latest.community_demand_kwh) *
            100
          : 0,
        100,
      )
    : 0;
  const gridShare = 100 - solarShare;
  const hasLatest = !!latest;

  return (
    <Card title={t("source.title")} subtitle={t("source.subtitle")} data-testid="source-mix">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700">
            <Sun size={14} />
          </span>
          <div>
            <div className="text-slate-500 text-xs">{t("source.solar")}</div>
            <div className="font-semibold text-slate-900" data-testid="source-solar-pct">
              {solarShare.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-700">
            <Zap size={14} />
          </span>
          <div>
            <div className="text-slate-500 text-xs">{t("source.grid")}</div>
            <div className="font-semibold text-slate-900" data-testid="source-grid-pct">
              {gridShare.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
      <div
        className="h-4 bg-slate-200 rounded-full overflow-hidden flex"
        role="img"
        aria-label={`${t("source.solar")} ${solarShare.toFixed(1)}%`}
      >
        <div
          className="bg-gradient-to-r from-amber-300 to-amber-500 transition-[width] duration-500"
          style={{ width: `${solarShare}%` }}
          data-testid="source-solar-bar"
        />
        <div
          className="bg-gradient-to-r from-slate-400 to-slate-600 transition-[width] duration-500"
          style={{ width: `${gridShare}%` }}
          data-testid="source-grid-bar"
        />
      </div>
      {hasLatest && (
        <div className="mt-3 text-xs text-slate-500" data-testid="source-timestamp">
          {new Date(latest!.hour).toLocaleString()}
        </div>
      )}
    </Card>
  );
}
