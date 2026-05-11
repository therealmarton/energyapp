import { useTranslation } from "react-i18next";

import { Card } from "../components/ui/Card";
import { SourceMix } from "../components/panels/SourceMix";
import { formatKwh, formatPct } from "../components/ui/formatting";
import { useSettlement } from "../components/hooks/useSettlement";

export function LivePage() {
  const { t } = useTranslation();
  const { data, isLoading } = useSettlement();

  if (isLoading) return <div className="text-slate-500" data-testid="loading">{t("loading")}</div>;
  if (!data) return <div className="text-slate-500">{t("noData")}</div>;

  const recent = [...data.hourly].slice(-12).reverse();

  return (
    <div className="space-y-6" data-testid="page-live">
      <SourceMix data={data} />
      <Card title={t("live.recentTitle")} subtitle={t("live.recentSubtitle")} bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/60 text-slate-500 border-b border-slate-100 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">{t("live.hour")}</th>
                <th className="px-3 py-3 font-medium text-right">{t("live.supply")}</th>
                <th className="px-3 py-3 font-medium text-right">{t("live.demand")}</th>
                <th className="px-5 py-3 font-medium text-right">{t("live.selfSuff")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((h) => (
                <tr key={h.hour} className="border-b border-slate-100 last:border-0">
                  <td className="px-5 py-2.5 tabular-nums">{new Date(h.hour).toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatKwh(h.community_supply_kwh)} kWh
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatKwh(h.community_demand_kwh)} kWh
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-medium text-amber-700">
                    {formatPct(h.self_sufficiency_pct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
