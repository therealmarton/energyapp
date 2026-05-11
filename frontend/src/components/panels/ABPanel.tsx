import { useTranslation } from "react-i18next";
import { ArrowDownRight, Leaf, Receipt } from "lucide-react";

import { formatFt, formatPct } from "../ui/formatting";
import { Card } from "../ui/Card";
import { StatCard } from "../ui/StatCard";
import type { PerUserSettlement, SettlementResponse } from "../../api";

interface Props {
  data: SettlementResponse;
  scope?: PerUserSettlement; // when defined, renders per-user numbers
}

export function ABPanel({ data, scope }: Props) {
  const { t } = useTranslation();
  const baseline = scope ? scope.baseline_cost_ft : data.total_baseline_ft;
  const community = scope ? scope.community_cost_ft : data.total_community_ft;
  const savings = scope ? scope.savings_ft : data.total_savings_ft;
  const pct = baseline !== 0 ? ((baseline - community) / Math.abs(baseline)) * 100 : 0;

  return (
    <Card
      title={scope ? t("ab.titlePersonal", { name: scope.name }) : t("ab.title")}
      subtitle={scope ? t("ab.subtitlePersonal") : t("ab.subtitle")}
      data-testid="ab-panel"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          tone="grid"
          icon={<Receipt size={18} />}
          label={t("ab.without")}
          value={
            <span data-testid="ab-baseline">
              {formatFt(baseline)} <span className="text-sm text-slate-400 font-normal">Ft</span>
            </span>
          }
          hint={t("ab.withoutHint")}
        />
        <StatCard
          tone="brand"
          icon={<Leaf size={18} />}
          label={t("ab.with")}
          value={
            <span data-testid="ab-community">
              {formatFt(community)} <span className="text-sm text-slate-400 font-normal">Ft</span>
            </span>
          }
          hint={t("ab.withHint")}
        />
        <StatCard
          tone="savings"
          icon={<ArrowDownRight size={18} />}
          label={t("ab.savings")}
          value={
            <span className="text-savings-dark" data-testid="ab-savings">
              {formatFt(savings)} <span className="text-sm text-emerald-700/60 font-normal">Ft</span>
            </span>
          }
          hint={
            <span data-testid="ab-savings-pct">
              {formatPct(pct)} {t("ab.vsBaseline")}
            </span>
          }
        />
      </div>

      {!scope && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {t("ab.selfSufficiency")}
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900" data-testid="ab-selfsuff">
              {formatPct(data.self_sufficiency_pct)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {t("ab.hoursAnalysed")}
            </div>
            <div className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
              {data.hourly.length}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
